// ERSMS service worker.
//
// ── History / why this file is cautious ──────────────────────────────
// v1 precached "/dashboard" and, on any failed request, fell back to that
// cached response. If the SW installed before login (or after a session
// expired), the cached "/dashboard" was actually a redirect to "/login".
// Serving that stale redirect during a brief network drop looked exactly
// like the user being logged out. That bug is the reason v2 refused to
// cache authenticated pages at all.
//
// ── v3 (Day 7a) ──────────────────────────────────────────────────────
// v3 adds offline capability WITHOUT reopening that bug, by drawing a
// hard line between two kinds of responses:
//
//   SAFE TO CACHE — content-hashed build assets (/_next/static/*) and
//   static public files. These are immutable, contain no user data, and
//   are never auth-dependent, so a cached copy can never misrepresent
//   session state.
//
//   NEVER CACHED — any HTML page under the authenticated app, any API
//   route, any server action, any RSC payload. These are exactly what
//   caused v1's bug: their content depends on who you are and whether
//   you're signed in.
//
// The single exception is "/offline-data": a standalone route outside the
// authenticated layout that renders NO user data server-side (it reads
// everything from IndexedDB at runtime). Its HTML is effectively a static
// shell, so caching it cannot leak data or fake a session — which is what
// makes an offline view possible at all.
const CACHE_NAME = "ersms-cache-v3";
const OFFLINE_URL = "/offline.html";
const OFFLINE_DATA_URL = "/offline-data";

const PRECACHE = [OFFLINE_URL, OFFLINE_DATA_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Don't let one failed precache entry abort the whole install.
      Promise.allSettled(PRECACHE.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

function isCacheableAsset(url) {
  // Content-hashed build output and static public assets only.
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/logo-full.png" ||
    url.pathname === "/manifest.json" ||
    /\.(?:css|js|woff2?|png|jpg|jpeg|svg|ico)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never touch API routes or RSC/server-action traffic — these must always
  // hit the network so a stale copy can never stand in for real auth state.
  if (url.pathname.startsWith("/api/") || url.searchParams.has("_rsc")) {
    return;
  }

  // Build assets: cache-first (immutable, content-hashed, no user data).
  if (isCacheableAsset(url)) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  // Page navigations: network-first, always. On failure fall back to the
  // offline data view (no user data in its shell) and then to the plain
  // offline page. We never serve a cached authenticated page.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (
          (await cache.match(OFFLINE_DATA_URL)) ||
          (await cache.match(OFFLINE_URL)) ||
          Response.error()
        );
      })
    );
  }
});
