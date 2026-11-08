import "server-only";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { recordAudit } from "@/features/audit/server/record-audit";
import { transitionClaim } from "@/features/claims/server/transition-claim";
import { claimScopeWhere } from "@/features/claims/server/claim-scope";
import { LinkQuerySchema, type LinkQueryInput } from "../schemas";
import { queryScopeWhere } from "./query-scope";

export async function linkQuery(user: SessionUser, input: LinkQueryInput) {
  const parsed = LinkQuerySchema.parse(input);

  const query = await db.tpaQuery.findFirst({
    where: {
      id: parsed.queryId,
      ...queryScopeWhere(user),
    },
  });

  if (!query) throw new NotFoundError("Query not found");
  if (query.claimId !== null) throw new ConflictError("Query is already linked to a claim");

  const claim = await db.claim.findFirst({
    where: {
      id: parsed.claimId,
      ...claimScopeWhere(user),
    },
    select: { id: true, stage: true, status: true },
  });

  if (!claim) throw new NotFoundError("Claim not found");

  return await db.$transaction(async (tx) => {
    const updated = await tx.tpaQuery.update({
      where: { id: query.id },
      data: {
        claimId: claim.id,
        suggestedClaimId: null,
      },
    });

    if (claim.status === "SENT") {
      await transitionClaim(tx, claim, "RAISE_QUERY", {
        actorId: user.id,
        data: { queryId: query.id },
      });
    }

    await recordAudit(tx, {
      actorId: user.id,
      action: "QUERY_LINKED",
      entityType: "TpaQuery",
      entityId: query.id,
      claimId: claim.id,
      data: {
        previousSuggestedClaimId: query.suggestedClaimId,
      },
    });

    return updated;
  });
}
