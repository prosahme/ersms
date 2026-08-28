import { openDB } from "idb";

const DB_NAME = "ersms-offline";
const STORE_NAME = "pending-actions";

export async function getDB() {
  return openDB(DB_NAME, 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
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