import { env } from "../env";
import type { AppStore } from "./interface";
import { MemoryStore } from "./memory-store";
import { PostgresStore } from "./postgres-store";

const globalForStore = globalThis as unknown as {
  storeInstance: AppStore | undefined;
};

export function getStore(): AppStore {
  if (globalForStore.storeInstance) {
    return globalForStore.storeInstance;
  }

  let storeInstance: AppStore;

  if (env.storeAdapter === "postgres") {
    if (!env.databaseUrl) {
      throw new Error("STORE_ADAPTER=postgres requires DATABASE_URL");
    }
    storeInstance = new PostgresStore(env.databaseUrl);
  } else {
    storeInstance = new MemoryStore();
  }

  if (process.env.NODE_ENV !== "production") {
    globalForStore.storeInstance = storeInstance;
  }

  return storeInstance;
}
