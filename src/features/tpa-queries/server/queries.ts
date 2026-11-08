import "server-only";
import { cache } from "react";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { compareForInbox, matchesFilter, type InboxFilter } from "../domain/inbox-filter";
import { queryScopeWhere } from "./query-scope";

export const listInbox = cache(
  async (user: SessionUser, filter: InboxFilter = "open", now: Date = new Date()) => {
    const allQueries = await db.tpaQuery.findMany({
      where: queryScopeWhere(user),
      include: {
        payer: { select: { id: true, name: true, kind: true } },
        claim: {
          select: {
            id: true,
            code: true,
            patient: { select: { name: true } },
            assignee: { select: { id: true, name: true } },
          },
        },
        asks: {
          select: {
            id: true,
            text: true,
            documentType: { select: { label: true } },
          },
          orderBy: { position: "asc" },
        },
      },
    });

    const suggestedIds = allQueries.map((q) => q.suggestedClaimId).filter((id): id is string => Boolean(id));

    const suggestedClaims =
      suggestedIds.length > 0
        ? await db.claim.findMany({
            where: { id: { in: suggestedIds } },
            select: {
              id: true,
              code: true,
              patient: { select: { name: true } },
            },
          })
        : [];

    const suggestedMap = new Map(suggestedClaims.map((c) => [c.id, c]));

    const counts = {
      open: allQueries.filter((q) => matchesFilter("open", q, now)).length,
      dueToday: allQueries.filter((q) => matchesFilter("due-today", q, now)).length,
      overdue: allQueries.filter((q) => matchesFilter("overdue", q, now)).length,
      unmatched: allQueries.filter((q) => matchesFilter("unmatched", q, now)).length,
      answered: allQueries.filter((q) => matchesFilter("answered", q, now)).length,
    };

    const filtered = allQueries.filter((q) => matchesFilter(filter, q, now));
    const sorted = [...filtered].sort(compareForInbox);

    const rows = sorted.map((q) => ({
      ...q,
      suggestedClaim: q.suggestedClaimId ? (suggestedMap.get(q.suggestedClaimId) ?? null) : null,
    }));

    return {
      rows,
      counts,
    };
  },
);

export const getQueryDetail = cache(async (user: SessionUser, id: string) => {
  const query = await db.tpaQuery.findFirst({
    where: {
      id,
      ...queryScopeWhere(user),
    },
    include: {
      payer: true,
      claim: {
        include: {
          patient: true,
          procedure: true,
          assignee: { select: { id: true, name: true } },
          documents: {
            where: { deletedAt: null },
            select: {
              id: true,
              fileName: true,
              mimeType: true,
              documentTypeId: true,
              status: true,
              identityCheck: true,
              uploadedAt: true,
            },
            orderBy: { uploadedAt: "desc" },
          },
        },
      },
      asks: {
        include: {
          documentType: true,
        },
        orderBy: { position: "asc" },
      },
      repliedBy: { select: { id: true, name: true } },
    },
  });

  if (!query) return null;

  let suggestedClaim = null;
  if (query.suggestedClaimId) {
    suggestedClaim = await db.claim.findUnique({
      where: { id: query.suggestedClaimId },
      include: {
        patient: true,
        procedure: true,
      },
    });
  }

  const claimDocs = query.claim?.documents ?? [];

  const asksWithState = query.asks.map((ask) => {
    if (!ask.documentTypeId) {
      return { ...ask, state: "ANSWER_IN_REPLY" as const };
    }
    const satisfied = claimDocs.some(
      (d) =>
        d.documentTypeId === ask.documentTypeId &&
        d.status === "SORTED" &&
        d.identityCheck !== "MISMATCH" &&
        d.uploadedAt >= query.receivedAt,
    );
    return {
      ...ask,
      state: (satisfied ? "SATISFIED" : "MISSING") as "SATISFIED" | "MISSING",
    };
  });

  return {
    ...query,
    suggestedClaim,
    asks: asksWithState,
  };
});

export const getInboxBadge = cache(async (user: SessionUser, now: Date) => {
  const openQueries = await db.tpaQuery.findMany({
    where: {
      ...queryScopeWhere(user),
      status: "OPEN",
    },
    select: {
      deadlineAt: true,
      status: true,
      claimId: true,
    },
  });

  const dueToday = openQueries.filter((q) => matchesFilter("due-today", q, now)).length;
  const overdue = openQueries.filter((q) => matchesFilter("overdue", q, now)).length;

  return {
    dueToday,
    overdue,
    hasOverdue: overdue > 0,
  };
});
