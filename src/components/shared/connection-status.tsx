"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { refreshSnapshot } from "@/lib/offline-cache";

type Status = "online" | "offline" | "syncing" | "synced" | "failed";

// Day 7a connection indicator.
//
// Deliberately honest about what it promises: this build caches data for
// offline VIEWING and SEARCH only. It does not claim work is "saved
// locally" — offline mutations are Day 7b and are not implemented, so
// telling the user their changes are safe would be false.
export function ConnectionStatus() {
  const [status, setStatus] = useState<Status>("online");
  const [lastSync, setLastSync] = useState<string | null>(null);

  const doRefresh = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setStatus("offline");
      return;
    }
    setStatus("syncing");
    try {
      const snap = await refreshSnapshot();
      if (snap) {
        setLastSync(new Date(snap.snapshotAt).toLocaleTimeString());
        setStatus("synced");
        // Settle back to the quiet "online" state after a moment.
        setTimeout(() => setStatus((s) => (s === "synced" ? "online" : s)), 2500);
      } else {
        setStatus("failed");
      }
    } catch {
      setStatus("failed");
    }
  }, []);

  useEffect(() => {
    function handleOnline() {
      doRefresh();
    }
    function handleOffline() {
      setStatus("offline");
    }

    if (typeof navigator !== "undefined") {
      setStatus(navigator.onLine ? "online" : "offline");
      if (navigator.onLine) doRefresh();
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodically refresh the cache while the app is open and online, so
    // the offline copy doesn't go badly stale during a long shift.
    const interval = setInterval(() => {
      if (navigator.onLine) doRefresh();
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [doRefresh]);

  // Stay quiet when everything is normal.
  if (status === "online") return null;

  const styles: Record<Status, string> = {
    online: "",
    offline: "bg-amber-600 text-white",
    syncing: "bg-slate-700 text-white",
    synced: "bg-green-600 text-white",
    failed: "bg-red-600 text-white",
  };

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-md text-sm font-medium shadow-lg flex items-center gap-3 ${styles[status]}`}
      role="status"
      aria-live="polite"
    >
      {status === "offline" && (
        <>
          <span>Offline — you can still view and search saved data</span>
          <Link href="/offline-data" className="underline whitespace-nowrap">
            Open
          </Link>
        </>
      )}
      {status === "syncing" && <span>Updating offline data…</span>}
      {status === "synced" && <span>Offline data updated{lastSync ? ` at ${lastSync}` : ""}</span>}
      {status === "failed" && (
        <>
          <span>Couldn&apos;t update offline data</span>
          <button type="button" onClick={doRefresh} className="underline whitespace-nowrap">
            Retry
          </button>
        </>
      )}
    </div>
  );
}
