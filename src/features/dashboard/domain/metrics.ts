import type { DeductionReason, SortedBy, Stage } from "@/lib/enums";
import { istDateKey } from "@/lib/format";
import { DEDUCTION_REASON_LABEL } from "@/features/claims/domain/labels";
import type { StageClock } from "@/features/claims/domain/clocks";
import { PAYER_DECISION_TARGET_MS } from "@/features/claims/domain/targets";

export type DeductionMetric = {
  reason: DeductionReason;
  label: string;
  amount: number;
  share: number;
};

export type PendingApprovalItem = {
  code: string;
  patientName: string;
  payerName: string;
  stage: Stage;
  sinceMs: number;
  pastTarget: boolean;
  overdueMs: number;
};

export function sameDayReplyRate(queries: Array<{ receivedAt: Date; repliedAt: Date | null }>): {
  total: number;
  sameDay: number;
  rate: number;
} {
  const answered = queries.filter((q) => q.repliedAt !== null);
  if (answered.length === 0) {
    return { total: 0, sameDay: 0, rate: 0 };
  }

  const sameDay = answered.filter((q) => istDateKey(q.receivedAt) === istDateKey(q.repliedAt!)).length;

  return {
    total: answered.length,
    sameDay,
    rate: Math.round((sameDay / answered.length) * 100),
  };
}

export function averageDischargeWait(clocks: StageClock[]): {
  hospitalMs: number;
  payerMs: number;
  totalMs: number;
  count: number;
} {
  if (clocks.length === 0) {
    return { hospitalMs: 0, payerMs: 0, totalMs: 0, count: 0 };
  }

  const totalHosp = clocks.reduce((acc, c) => acc + c.hospitalMs, 0);
  const totalPayer = clocks.reduce((acc, c) => acc + c.payerMs, 0);

  const hospitalMs = Math.round(totalHosp / clocks.length);
  const payerMs = Math.round(totalPayer / clocks.length);

  return {
    hospitalMs,
    payerMs,
    totalMs: hospitalMs + payerMs,
    count: clocks.length,
  };
}

export function deductionsByReason(
  rows: Array<{ reason: DeductionReason; amount: number }>,
): DeductionMetric[] {
  const totals = new Map<DeductionReason, number>();
  let grandTotal = 0;

  for (const row of rows) {
    totals.set(row.reason, (totals.get(row.reason) ?? 0) + row.amount);
    grandTotal += row.amount;
  }

  const results: DeductionMetric[] = [];
  for (const [reason, amount] of totals.entries()) {
    if (amount <= 0) continue;
    results.push({
      reason,
      label: DEDUCTION_REASON_LABEL[reason] ?? reason,
      amount,
      share: grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0,
    });
  }

  return results.sort((a, b) => b.amount - a.amount);
}

export function pendingApprovals(
  claims: Array<{
    code: string;
    patientName: string;
    payerName: string;
    stage: Stage;
    sinceMs: number;
  }>,
): PendingApprovalItem[] {
  return [...claims]
    .map((c) => {
      const target = PAYER_DECISION_TARGET_MS[c.stage] ?? 3600000;
      const pastTarget = c.sinceMs > target;
      const overdueMs = Math.max(0, c.sinceMs - target);
      return {
        ...c,
        pastTarget,
        overdueMs,
      };
    })
    .sort((a, b) => b.sinceMs - a.sinceMs);
}

export function aiSortingRate(docs: Array<{ sortedBy: SortedBy | null; aiDocumentTypeKey: string | null }>): {
  total: number;
  aiSorted: number;
  rate: number;
} {
  const eligible = docs.filter((d) => d.aiDocumentTypeKey !== null);
  if (eligible.length === 0) {
    return { total: 0, aiSorted: 0, rate: 0 };
  }

  const aiSorted = eligible.filter((d) => d.sortedBy === "AI").length;
  return {
    total: eligible.length,
    aiSorted,
    rate: Math.round((aiSorted / eligible.length) * 100),
  };
}
