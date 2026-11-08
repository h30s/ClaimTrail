import "server-only";
import { db } from "@/lib/db";
import type { Payer } from "@/generated/prisma/client";

export async function findPayerByEmail(fromAddress: string): Promise<Payer | null> {
  const parts = fromAddress.split("@");
  const domain = parts[1]?.toLowerCase().trim();
  if (!domain) return null;

  return db.payer.findFirst({
    where: {
      emailDomain: domain,
      active: true,
    },
  });
}
