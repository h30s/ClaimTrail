import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "./env";

const globalForDb = globalThis as unknown as { db?: PrismaClient };

export const db =
  globalForDb.db ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  });

if (process.env.NODE_ENV !== "production") globalForDb.db = db;
