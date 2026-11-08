import { env } from "@/lib/env";
import { createLocalDriver } from "./local-driver";
import { createSupabaseDriver } from "./supabase-driver";
import type { StorageDriver } from "./types";

export * from "./types";
export * from "./storage-key";

export const storage: StorageDriver =
  env.STORAGE_DRIVER === "supabase" ? createSupabaseDriver() : createLocalDriver();
