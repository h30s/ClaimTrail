import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { AppError, NotFoundError } from "@/lib/errors";
import type { StorageDriver } from "./types";

export function createSupabaseDriver(bucketName = "documents"): StorageDriver {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new AppError("Supabase storage requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  return {
    async put(key: string, bytes: Uint8Array, contentType: string): Promise<void> {
      const { error } = await supabase.storage.from(bucketName).upload(key, bytes, {
        contentType,
        upsert: false,
      });

      if (error) {
        throw new AppError(`Supabase upload failed: ${error.message}`);
      }
    },

    async get(key: string): Promise<Uint8Array> {
      const { data, error } = await supabase.storage.from(bucketName).download(key);

      if (error || !data) {
        throw new NotFoundError(`File not found in Supabase storage: ${key}`);
      }

      const buffer = await data.arrayBuffer();
      return new Uint8Array(buffer);
    },

    async removePrefix(prefix: string): Promise<void> {
      const { data, error } = await supabase.storage.from(bucketName).list(prefix, {
        limit: 100,
      });

      if (error) {
        throw new AppError(`Failed to list files for prefix ${prefix}: ${error.message}`);
      }

      if (data && data.length > 0) {
        const paths = data.map((item) => `${prefix}/${item.name}`);
        const { error: removeError } = await supabase.storage.from(bucketName).remove(paths);
        if (removeError) {
          throw new AppError(`Failed to remove files: ${removeError.message}`);
        }
      }
    },
  };
}
