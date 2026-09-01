// ERSMS service worker.
//
// v2 fix: the previous version precached "/dashboard" at install time and,
// on any failed request while offline, fell back to that cached response.
// If the service worker installed before the user logged in (or after a
// session expired), the cached "/dashboard" response was actually a
// redirect to "/login" (produced by the auth middleware). Serving that
// stale redirect back during a temporary network drop looked exactly like
// the user being logged out, even though their session was still valid.
//
// This version:
//   1. Never precaches or falls back to authenticated app pages.
//   2. Only intercepts page navigations (not API calls or server actions),
//      so a network hiccup during a data request never gets silently
//      swapped for stale cached HTML.
//   3. Falls back to a small static "you're offline" page instead of any
//      cached application route, so we never risk serving a stale
//      redirect as if it were current app state.
//   4. Bumps the cache name and clears old caches on activate, so every
//      client picks up this fix instead of keeping a bad cached response
//      from v1 forever.
const CACHE_NAME = "ersms-cache-v2";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL]))
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

self.addEventListener("fetch", (event) => {
  // Only handle GET page navigations. Everything else (API routes, server
  // actions, data fetching) must always go straight to the network — we
  // never want to serve stale cached data or HTML for those.
  if (event.request.method !== "GET" || event.request.mode !== "navigate") {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(async () => {
      const offlinePage = await caches.match(OFFLINE_URL);
      return offlinePage || Response.error();
    })
  );
});
