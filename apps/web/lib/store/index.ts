import { env } from "../env";
import type { AppStore } from "./interface";
import { MemoryStore } from "./memory-store";
import { PostgresStore } from "./postgres-store";

let storeInstance: AppStore | null = null;

export function getStore(): AppStore {
  if (storeInstance) {
    return storeInstance;
  }

  if (env.storeAdapter === "postgres") {
    if (!env.databaseUrl) {
      throw new Error("STORE_ADAPTER=postgres requires DATABASE_URL");
    }
    storeInstance = new PostgresStore(env.databaseUrl);
    return storeInstance;
  }

  storeInstance = new MemoryStore();
  return storeInstance;
}
