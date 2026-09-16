import { openDB } from "idb";

// NOTE: this database is shared with src/lib/offline-cache.ts (Day 7a read
// cache). Both files must open the SAME version and both must create every
// store in upgrade(), otherwise whichever opens with the lower version
// throws a VersionError at runtime. Version bumped 2 -> 3 alongside the
// snapshot store added in offline-cache.ts.
//
// The queueAction/getQueuedActions helpers below are currently UNUSED —
// offline mutations are Day 7b, not 7a. They are left in place (rather
// than deleted) so the store isn't dropped from existing installs.
const DB_NAME = "ersms-offline";
const DB_VERSION = 3;
const STORE_NAME = "pending-actions";
const SNAPSHOT_STORE = "snapshot";

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(SNAPSHOT_STORE)) {
        db.createObjectStore(SNAPSHOT_STORE);
      }
    },
  });
}

export async function queueAction(type: string, data: Record<string, string>) {
  const db = await getDB();
  await db.add(STORE_NAME, { type, data, createdAt: Date.now() });
}

export async function getQueuedActions() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function removeQueuedAction(id: number) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}