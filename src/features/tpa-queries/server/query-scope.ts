import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { SessionUser } from "@/lib/auth/session";

export function queryScopeWhere(user: SessionUser): Prisma.TpaQueryWhereInput {
  if (user.role === "DESK_HEAD") {
    return {};
  }
  return {
    OR: [{ claimId: null }, { claim: { assigneeId: user.id } }],
  };
}
