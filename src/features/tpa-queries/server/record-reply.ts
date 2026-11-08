import "server-only";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { recordAudit } from "@/features/audit/server/record-audit";
import { transitionClaim } from "@/features/claims/server/transition-claim";
import { claimScopeWhere } from "@/features/claims/server/claim-scope";
import { RecordReplySchema, type RecordReplyInput } from "../schemas";
import { queryScopeWhere } from "./query-scope";

export async function recordReply(user: SessionUser, input: RecordReplyInput) {
  const parsed = RecordReplySchema.parse(input);

  const query = await db.tpaQuery.findFirst({
    where: {
      id: parsed.queryId,
      ...queryScopeWhere(user),
    },
  });

  if (!query) throw new NotFoundError("Query not found");
  if (!query.claimId) throw new ConflictError("Query must be linked to a claim before replying");
  if (query.status === "ANSWERED") throw new ConflictError("Query has already been answered");

  const claim = await db.claim.findFirst({
    where: {
      id: query.claimId,
      ...claimScopeWhere(user),
    },
    select: { id: true, stage: true, status: true },
  });

  if (!claim) throw new NotFoundError("Claim not found");

  if (parsed.documentIds.length > 0) {
    const validDocCount = await db.document.count({
      where: {
        id: { in: parsed.documentIds },
        claimId: claim.id,
        deletedAt: null,
      },
    });
    if (validDocCount !== parsed.documentIds.length) {
      throw new ConflictError("One or more attached documents do not belong to this claim");
    }
  }

  const repliedAt = new Date();

  return await db.$transaction(async (tx) => {
    const updated = await tx.tpaQuery.update({
      where: { id: query.id },
      data: {
        replyBody: parsed.replyBody,
        replyDocumentIds: parsed.documentIds,
        repliedAt,
        repliedById: user.id,
        status: "ANSWERED",
      },
    });

    const otherOpen = await tx.tpaQuery.count({
      where: {
        claimId: claim.id,
        id: { not: query.id },
        status: "OPEN",
      },
    });

    if (claim.status === "QUERY" && otherOpen === 0) {
      await transitionClaim(tx, claim, "ANSWER_QUERY", {
        actorId: user.id,
        data: { queryId: query.id, documentIds: parsed.documentIds },
      });
    }

    await recordAudit(tx, {
      actorId: user.id,
      action: "QUERY_REPLIED",
      entityType: "TpaQuery",
      entityId: query.id,
      claimId: claim.id,
      data: {
        documentCount: parsed.documentIds.length,
      },
    });

    return updated;
  });
}
