import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { AppError, NotFoundError } from "@/lib/errors";
import type { StorageDriver } from "./types";

export function createLocalDriver(baseDir?: string): StorageDriver {
  const root = baseDir ?? path.join(process.cwd(), ".data", "uploads");

  const resolvePath = (key: string): string => {
    if (key.includes("..") || path.isAbsolute(key)) {
      throw new AppError("Invalid storage key path traversal");
    }
    return path.join(root, key);
  };

  return {
    async put(key: string, bytes: Uint8Array): Promise<void> {
      const fullPath = resolvePath(key);
      await mkdir(path.dirname(fullPath), { recursive: true });
      await writeFile(fullPath, bytes);
    },

    async get(key: string): Promise<Uint8Array> {
      const fullPath = resolvePath(key);
      try {
        const buffer = await readFile(fullPath);
        return new Uint8Array(buffer);
      } catch (err: unknown) {
        if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") {
          throw new NotFoundError(`File not found: ${key}`);
        }
        throw err;
      }
    },

    async removePrefix(prefix: string): Promise<void> {
      const fullPath = resolvePath(prefix);
      await rm(fullPath, { recursive: true, force: true });
    },
  };
}
