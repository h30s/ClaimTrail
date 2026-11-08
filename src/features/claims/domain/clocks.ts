// clocks.ts — Splits elapsed time by who holds the ball: the hospital (drafting, answering
// a query) or the payer (deciding). IRDAI times the payer; the brief asks us to time ourselves too.
import type { ClaimStatus, Stage } from "@/lib/enums";

export type Holder = "HOSPITAL" | "PAYER";
export type TimelinePoint = { at: Date; stage: Stage; status: ClaimStatus };
export type StageClock = { hospitalMs: number; payerMs: number };
export type ClockReport = {
  byStage: Partial<Record<Stage, StageClock>>;
  current: { holder: Holder; stage: Stage; sinceMs: number } | null;
};

export function holderOf(status: ClaimStatus): Holder | null {
  if (status === "DRAFT" || status === "QUERY") return "HOSPITAL";
  if (status === "SENT") return "PAYER";
  return null;
}

export function computeClocks(points: TimelinePoint[], now: Date): ClockReport {
  const sorted = [...points].sort((a, b) => a.at.getTime() - b.at.getTime());
  const byStage: Partial<Record<Stage, StageClock>> = {};

  sorted.forEach((point, i) => {
    const holder = holderOf(point.status);
    if (!holder) return;
    const end = sorted[i + 1]?.at ?? now;
    const ms = Math.max(0, end.getTime() - point.at.getTime());
    const clock = (byStage[point.stage] ??= { hospitalMs: 0, payerMs: 0 });
    if (holder === "HOSPITAL") clock.hospitalMs += ms;
    else clock.payerMs += ms;
  });

  const last = sorted.at(-1);
  const holder = last ? holderOf(last.status) : null;
  return {
    byStage,
    current:
      last && holder
        ? {
            holder,
            stage: last.stage,
            sinceMs: Math.max(0, now.getTime() - last.at.getTime()),
          }
        : null,
  };
}
