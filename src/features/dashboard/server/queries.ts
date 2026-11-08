import "server-only";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { istDateKey } from "@/lib/format";
import { claimScopeWhere } from "@/features/claims/server/claim-scope";
import { computeClocks, type StageClock } from "@/features/claims/domain/clocks";
import {
  aiSortingRate,
  averageDischargeWait,
  deductionsByReason,
  pendingApprovals,
  sameDayReplyRate,
  type DeductionMetric,
  type PendingApprovalItem,
} from "../domain/metrics";

export type DashboardData = {
  days: number;
  pendingApprovalsList: PendingApprovalItem[];
  pendingCount: number;
  oldestPendingMs: number;
  queriesDueTodayCount: number;
  queriesOverdueCount: number;
  sameDayReplies: { total: number; sameDay: number; rate: number };
  dischargeWait: { hospitalMs: number; payerMs: number; totalMs: number; count: number };
  deductions: DeductionMetric[];
  aiSorting: { total: number; aiSorted: number; rate: number };
};

export async function getDashboard(
  user: SessionUser,
  params: { days?: number },
  now: Date = new Date(),
): Promise<DashboardData> {
  const days = params.days === 7 || params.days === 90 ? params.days : 30;
  const windowStart = new Date(now.getTime() - days * 86400000);
  const scope = claimScopeWhere(user);

  // 1. Pending approvals
  const sentClaims = await db.claim.findMany({
    where: { status: "SENT", ...scope },
    include: {
      patient: { select: { name: true } },
      payer: { select: { name: true } },
    },
    orderBy: { statusChangedAt: "asc" },
  });

  const pendingItems = pendingApprovals(
    sentClaims.map((c) => ({
      code: c.code,
      patientName: c.patient.name,
      payerName: c.payer.name,
      stage: c.stage,
      sinceMs: Math.max(0, now.getTime() - c.statusChangedAt.getTime()),
    })),
  );

  // 2. Open queries due today / overdue
  const queryScope =
    user.role === "DESK_HEAD"
      ? {}
      : {
          OR: [{ claimId: null }, { claim: { assigneeId: user.id } }],
        };

  const openQueries = await db.tpaQuery.findMany({
    where: { status: "OPEN", ...queryScope },
    select: { deadlineAt: true },
  });

  const todayKey = istDateKey(now);
  const queriesOverdueCount = openQueries.filter((q) => q.deadlineAt < now).length;
  const queriesDueTodayCount = openQueries.filter((q) => istDateKey(q.deadlineAt) === todayKey).length;

  // 3. Same-day reply rate
  const repliedQueries = await db.tpaQuery.findMany({
    where: {
      status: "ANSWERED",
      repliedAt: { gte: windowStart, lte: now },
      ...(user.role === "DESK_HEAD"
        ? {}
        : {
            OR: [{ claim: { assigneeId: user.id } }, { repliedById: user.id }],
          }),
    },
    select: { receivedAt: true, repliedAt: true },
  });
  const sameDayReplies = sameDayReplyRate(repliedQueries);

  // 4. Discharge wait
  const dischargeApprovedEvents = await db.claimEvent.findMany({
    where: {
      stage: "DISCHARGE",
      type: "APPROVED",
      at: { gte: windowStart, lte: now },
      claim: scope,
    },
    include: {
      claim: {
        include: {
          events: { orderBy: { at: "asc" } },
        },
      },
    },
  });

  const dischargeClocks: StageClock[] = [];
  const seenClaimIds = new Set<string>();

  for (const ev of dischargeApprovedEvents) {
    if (seenClaimIds.has(ev.claimId)) continue;
    seenClaimIds.add(ev.claimId);
    const clocks = computeClocks(ev.claim.events, ev.at);
    if (clocks.byStage.DISCHARGE) {
      dischargeClocks.push(clocks.byStage.DISCHARGE);
    }
  }
  const dischargeWait = averageDischargeWait(dischargeClocks);

  // 5. Deductions
  const deductionRows = await db.deduction.findMany({
    where: {
      claim: {
        status: "SETTLED",
        statusChangedAt: { gte: windowStart, lte: now },
        ...scope,
      },
    },
    select: { reason: true, amount: true },
  });
  const deductions = deductionsByReason(deductionRows);

  // 6. AI sorting stats
  const documents = await db.document.findMany({
    where: {
      deletedAt: null,
      aiDocumentTypeKey: { not: null },
      uploadedAt: { gte: windowStart, lte: now },
      ...(user.role === "DESK_HEAD" ? {} : { claim: scope }),
    },
    select: { sortedBy: true, aiDocumentTypeKey: true },
  });
  const aiSorting = aiSortingRate(documents);

  return {
    days,
    pendingApprovalsList: pendingItems,
    pendingCount: pendingItems.length,
    oldestPendingMs: pendingItems[0]?.sinceMs ?? 0,
    queriesDueTodayCount,
    queriesOverdueCount,
    sameDayReplies,
    dischargeWait,
    deductions,
    aiSorting,
  };
}
