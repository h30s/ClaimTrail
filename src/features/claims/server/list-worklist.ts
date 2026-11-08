import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { listDocumentTypes } from "@/features/catalog/server/queries";
import { loadRules } from "@/features/checklist/server/load-rules";
import { buildClaimInsight } from "../domain/claim-insight";
import type { WorklistFilters, WorklistRowDto } from "../types";
import { claimScopeWhere } from "./claim-scope";

export async function listWorklist(
  user: SessionUser,
  filters: WorklistFilters,
  now: Date,
): Promise<{ rows: WorklistRowDto[]; counts: Record<string, number> }> {
  const scope = claimScopeWhere(user);

  const whereBase: Prisma.ClaimWhereInput = {
    ...scope,
    ...(filters.payerId && { payerId: filters.payerId }),
    ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
    ...(filters.q && {
      OR: [
        { code: { contains: filters.q, mode: "insensitive" } },
        { policyNumber: { contains: filters.q, mode: "insensitive" } },
        { patient: { name: { contains: filters.q, mode: "insensitive" } } },
        { patient: { uhid: { contains: filters.q, mode: "insensitive" } } },
      ],
    }),
  };

  const [claims, rules, docTypes] = await Promise.all([
    db.claim.findMany({
      where: whereBase,
      include: {
        patient: { select: { name: true, uhid: true } },
        payer: { select: { name: true, kind: true } },
        procedure: { select: { name: true } },
        assignee: { select: { name: true } },
        events: {
          select: { type: true, stage: true, status: true, at: true },
          orderBy: { at: "asc" },
        },
        documents: {
          where: { deletedAt: null },
          select: {
            id: true,
            documentTypeId: true,
            status: true,
            identityCheck: true,
            uploadedAt: true,
          },
        },
        fields: { select: { fieldKey: true, confirmedAt: true } },
        queries: {
          where: { status: "OPEN" },
          select: {
            id: true,
            deadlineAt: true,
            receivedAt: true,
            asks: {
              select: {
                id: true,
                queryId: true,
                text: true,
                documentTypeId: true,
              },
            },
          },
        },
      },
    }),
    loadRules(),
    listDocumentTypes(),
  ]);

  const docTypeMap = new Map(docTypes.map((dt) => [dt.id, dt.label]));
  const labelFor = (id: string) => docTypeMap.get(id) ?? id;

  const allRows: WorklistRowDto[] = claims.map((c) => {
    const confirmedKeys = c.fields.filter((f) => f.confirmedAt !== null).map((f) => f.fieldKey);

    const openQueries = c.queries.map((q) => ({
      id: q.id,
      dueAt: q.deadlineAt,
      asks: q.asks.map((a) => ({
        id: a.id,
        queryId: a.queryId,
        text: a.text,
        documentTypeId: a.documentTypeId,
        receivedAt: q.receivedAt,
      })),
    }));

    const insight = buildClaimInsight({
      claim: {
        stage: c.stage,
        status: c.status,
        payerId: c.payerId,
        procedureId: c.procedureId,
        stageStartedAt: c.stageStartedAt,
      },
      rules,
      documents: c.documents,
      events: c.events,
      openQueries,
      confirmedFieldKeys: confirmedKeys,
      labelFor,
      now,
    });

    const earliestDueAt = openQueries.length
      ? new Date(Math.min(...openQueries.map((q) => q.dueAt.getTime())))
      : null;

    return {
      id: c.id,
      code: c.code,
      patientName: c.patient.name,
      uhid: c.patient.uhid,
      payerName: c.payer.name,
      payerKind: c.payer.kind,
      procedureName: c.procedure.name,
      stage: c.stage,
      status: c.status,
      assigneeName: c.assignee?.name ?? null,
      attention: insight.attention,
      urgency: insight.urgency,
      currentClock: insight.clocks.current,
      nextDueAt: earliestDueAt,
      statusChangedAt: c.statusChangedAt,
    };
  });

  const counts = {
    action: allRows.filter(
      (r) =>
        r.status !== "SETTLED" &&
        r.status !== "REJECTED" &&
        r.attention.some((a) => a.severity === "critical" || a.severity === "warning"),
    ).length,
    open: allRows.filter((r) => r.status !== "SETTLED" && r.status !== "REJECTED").length,
    sent: allRows.filter((r) => r.status === "SENT").length,
    settled: allRows.filter((r) => r.status === "SETTLED" || r.status === "REJECTED").length,
  };

  let filtered = allRows;
  if (filters.tab === "action") {
    filtered = allRows.filter(
      (r) =>
        r.status !== "SETTLED" &&
        r.status !== "REJECTED" &&
        r.attention.some((a) => a.severity === "critical" || a.severity === "warning"),
    );
  } else if (filters.tab === "open") {
    filtered = allRows.filter((r) => r.status !== "SETTLED" && r.status !== "REJECTED");
  } else if (filters.tab === "sent") {
    filtered = allRows.filter((r) => r.status === "SENT");
  } else if (filters.tab === "settled") {
    filtered = allRows.filter((r) => r.status === "SETTLED" || r.status === "REJECTED");
  }

  filtered.sort((a, b) => {
    if (b.urgency !== a.urgency) return b.urgency - a.urgency;
    if (a.nextDueAt && b.nextDueAt) {
      const diff = a.nextDueAt.getTime() - b.nextDueAt.getTime();
      if (diff !== 0) return diff;
    } else if (a.nextDueAt) return -1;
    else if (b.nextDueAt) return 1;
    return a.statusChangedAt.getTime() - b.statusChangedAt.getTime();
  });

  return { rows: filtered, counts };
}
