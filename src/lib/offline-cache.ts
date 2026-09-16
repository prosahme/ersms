import { openDB } from "idb";

// Day 7a read cache.
//
// Shares the same IndexedDB database as the (currently unused) pending-
// actions store in offline-db.ts, so the version number here must stay in
// step with that file. Version bumped 2 -> 3 to add the snapshot store.
//
// This cache holds ONLY data the server already decided the current user
// is allowed to see (see /api/offline/snapshot). Nothing is filtered on
// the client, because client-side filtering of sensitive data isn't a
// security boundary — the filtering happens server-side before the data
// is ever sent.
const DB_NAME = "ersms-offline";
const DB_VERSION = 3;
const PENDING_STORE = "pending-actions";
const SNAPSHOT_STORE = "snapshot";
const SNAPSHOT_KEY = "latest";

export type OfflineSnapshot = {
  snapshotAt: string;
  role: string;
  includesFinancials: boolean;
  customers: { id: string; name: string; phone: string; email: string | null }[];
  repairs: {
    id: string;
    ticketNumber: string;
    deviceType: string;
    deviceBrand: string;
    deviceModel: string;
    reportedProblem: string;
    status: string;
    dateReceived: string;
    customer: { id: string; name: string; phone: string };
    estimatedCost?: number;
    depositAmount?: number;
  }[];
  inventory: {
    id: string;
    name: string;
    sku: string;
    category: string;
    quantityAvailable: number;
    lowStockThreshold: number;
    unitPrice: number;
  }[];
};

async function getCacheDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        db.createObjectStore(PENDING_STORE, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(SNAPSHOT_STORE)) {
        db.createObjectStore(SNAPSHOT_STORE);
      }
    },
  });
}

/** Fetches a fresh authorized snapshot from the server and stores it locally. */
export async function refreshSnapshot(): Promise<OfflineSnapshot | null> {
  const res = await fetch("/api/offline/snapshot", { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as OfflineSnapshot;
  const db = await getCacheDB();
  await db.put(SNAPSHOT_STORE, data, SNAPSHOT_KEY);
  return data;
}

export async function readSnapshot(): Promise<OfflineSnapshot | null> {
  try {
    const db = await getCacheDB();
    return (await db.get(SNAPSHOT_STORE, SNAPSHOT_KEY)) ?? null;
  } catch {
    return null;
  }
}

/**
 * Clears cached data. Called on sign-out so one user's cached customers
 * and repairs are not left on the device for whoever logs in next.
 */
export async function clearSnapshot(): Promise<void> {
  try {
    const db = await getCacheDB();
    await db.delete(SNAPSHOT_STORE, SNAPSHOT_KEY);
  } catch {
    // Nothing cached / IndexedDB unavailable — nothing to clear.
  }
}
