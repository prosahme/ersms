"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, CheckCircle2, CircleAlert } from "lucide-react";
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

  const tone: Record<Exclude<Status, "online">, { card: string; icon: string }> = {
    offline: {
      card: "border-[#D4AF37]/50 shadow-[0_18px_50px_rgba(0,0,0,0.65),0_0_0_1px_rgba(212,175,55,0.08)]",
      icon: "border-[#D4AF37]/45 bg-[#D4AF37]/15 text-[#F5D76E]",
    },
    syncing: {
      card: "border-white/15 shadow-[0_18px_50px_rgba(0,0,0,0.65)]",
      icon: "border-white/20 bg-white/[0.06] text-white/80",
    },
    synced: {
      card: "border-emerald-400/40 shadow-[0_18px_50px_rgba(0,0,0,0.65)]",
      icon: "border-emerald-400/40 bg-emerald-500/15 text-emerald-300",
    },
    failed: {
      card: "border-red-400/45 shadow-[0_18px_50px_rgba(0,0,0,0.65)]",
      icon: "border-red-400/45 bg-red-500/15 text-red-300",
    },
  };

  const actionClass =
    "inline-flex min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[#D4AF37]/45 bg-[#D4AF37]/10 px-4 text-sm font-bold text-[#F5D76E] transition-all duration-200 hover:bg-[#D4AF37]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70";

  return (
    // The outer layer only centers; the card animates inside it, so the
    // slide-in never fights the centering.
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 sm:px-4"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div
        role="status"
        aria-live="polite"
        className={`ersms-fade-up pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border bg-[#0a0a0a]/95 p-3 pr-3.5 backdrop-blur-sm sm:w-auto sm:max-w-lg sm:pr-4 ${tone[status].card}`}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${tone[status].icon}`}
        >
          {status === "offline" && <WifiOff size={19} aria-hidden="true" />}
          {status === "syncing" && (
            <RefreshCw size={18} aria-hidden="true" className="animate-spin" />
          )}
          {status === "synced" && <CheckCircle2 size={19} aria-hidden="true" />}
          {status === "failed" && <CircleAlert size={19} aria-hidden="true" />}
        </span>

        <div className="min-w-0 flex-1 text-sm leading-5">
          {status === "offline" && (
            <>
              <p className="font-extrabold text-[#F5D76E]">Offline</p>
              <p className="text-white/60">you can still view and search saved data</p>
            </>
          )}
          {status === "syncing" && (
            <p className="font-semibold text-white/85">Updating offline data…</p>
          )}
          {status === "synced" && (
            <p className="font-semibold text-emerald-200">
              Offline data updated{lastSync ? ` at ${lastSync}` : ""}
            </p>
          )}
          {status === "failed" && (
            <p className="font-semibold text-red-200">Couldn&apos;t update offline data</p>
          )}
        </div>

        {status === "offline" && (
          <Link href="/offline-data" className={actionClass}>
            Open
          </Link>
        )}
        {status === "failed" && (
          <button type="button" onClick={doRefresh} className={actionClass}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
}