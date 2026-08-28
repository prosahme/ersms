"use client";

import { useEffect, useState } from "react";
import { getQueuedActions, removeQueuedAction } from "@/lib/offline-db";
import { createCustomerAction } from "@/app/(dashboard)/customers/actions";

export function OfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    async function sync() {
      const items = await getQueuedActions();
      for (const item of items) {
        try {
          const formData = new FormData();
          Object.entries(item.data).forEach(([key, value]) => formData.append(key, value as string));
          if (item.type === "customer") {
            await createCustomerAction({}, formData);
          }
          await removeQueuedAction(item.id);
        } catch {
          // leave queued, retry next sync
        }
      }
      setPendingCount((await getQueuedActions()).length);
    }

    function handleOnline() {
      setIsOnline(true);
      sync();
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    sync();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-md text-sm font-medium shadow-lg ${isOnline ? "bg-green-600 text-white" : "bg-amber-600 text-white"}`}>
      {!isOnline && "You're offline — changes save locally"}
      {isOnline && pendingCount > 0 && `Syncing ${pendingCount} saved item(s)...`}
    </div>
  );
}