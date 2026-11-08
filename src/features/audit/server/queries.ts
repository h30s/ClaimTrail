import "server-only";
import { db } from "@/lib/db";
import type { AuditAction } from "../domain/audit-actions";

export type AuditRowDto = {
  id: string;
  at: Date;
  actorId: string | null;
  actorName: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  claimId: string | null;
  claimCode: string | null;
  data: unknown;
};

export type ListAuditParams = {
  actorId?: string;
  action?: AuditAction;
  claimCode?: string;
  from?: Date;
  to?: Date;
  cursor?: string;
};

export async function listAudit(params: ListAuditParams = {}): Promise<{
  rows: AuditRowDto[];
  nextCursor: string | null;
}> {
  const take = 50;
  let claimIdFilter: string | undefined = undefined;

  if (params.claimCode) {
    const claim = await db.claim.findUnique({
      where: { code: params.claimCode },
      select: { id: true },
    });
    if (!claim) {
      return { rows: [], nextCursor: null };
    }
    claimIdFilter = claim.id;
  }

  const where = {
    ...(params.actorId ? { actorId: params.actorId } : {}),
    ...(params.action ? { action: params.action } : {}),
    ...(claimIdFilter ? { claimId: claimIdFilter } : {}),
    ...(params.from || params.to
      ? {
          at: {
            ...(params.from ? { gte: params.from } : {}),
            ...(params.to ? { lte: params.to } : {}),
          },
        }
      : {}),
  };

  const events = await db.auditEvent.findMany({
    where,
    include: {
      actor: { select: { name: true } },
    },
    orderBy: [{ at: "desc" }, { id: "desc" }],
    take: take + 1,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
  });

  const hasMore = events.length > take;
  const sliced = hasMore ? events.slice(0, take) : events;
  const nextCursor = hasMore ? (sliced.at(-1)?.id ?? null) : null;

  // Resolve claim codes for events that have claimId
  const claimIds = Array.from(
    new Set(sliced.map((e) => e.claimId).filter((id): id is string => Boolean(id))),
  );

  const claims =
    claimIds.length > 0
      ? await db.claim.findMany({
          where: { id: { in: claimIds } },
          select: { id: true, code: true },
        })
      : [];
  const claimCodeMap = new Map(claims.map((c) => [c.id, c.code]));

  const rows: AuditRowDto[] = sliced.map((e) => ({
    id: e.id,
    at: e.at,
    actorId: e.actorId,
    actorName: e.actor?.name ?? (e.actorId ? "Unknown user" : "System / External"),
    action: e.action as AuditAction,
    entityType: e.entityType,
    entityId: e.entityId,
    claimId: e.claimId,
    claimCode: e.claimId ? (claimCodeMap.get(e.claimId) ?? null) : null,
    data: e.data,
  }));

  return { rows, nextCursor };
}
