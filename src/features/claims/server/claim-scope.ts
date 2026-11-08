import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { can } from "@/lib/auth/permissions";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";

// A2: executives see only their assigned claims; the desk head sees all.
export function claimScopeWhere(user: SessionUser): Prisma.ClaimWhereInput {
  return can(user.role, "claim:view-all") ? {} : { assigneeId: user.id };
}

export async function assertClaimAccess(user: SessionUser, claimId: string): Promise<void> {
  const found = await db.claim.findFirst({
    where: { id: claimId, ...claimScopeWhere(user) },
    select: { id: true },
  });
  if (!found) throw new NotFoundError("Claim not found, or it isn't assigned to you.");
}
