import Link from "next/link";
import type { WorklistRowDto } from "../types";
import { AttentionSummary } from "./attention-summary";
import { ClockPair } from "./clock-pair";
import { StageStatusBadge } from "./stage-status-badge";

export function ClaimRow({ row }: { row: WorklistRowDto }) {
  return (
    <Link
      href={`/claims/${row.code}`}
      className="group border-border bg-surface hover:border-primary/40 hover:bg-muted/20 block rounded-lg border p-3.5 shadow-xs transition-all"
    >
      {/* Desktop view (>= sm) */}
      <div className="hidden flex-col gap-1.5 sm:flex">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="text-foreground group-hover:text-primary font-mono text-sm font-semibold transition-colors">
              {row.code}
            </span>
            <span className="text-foreground truncate text-sm font-medium">{row.patientName}</span>
            <span className="text-muted-foreground truncate text-xs">
              {row.payerName} <span className="text-muted-foreground/60">·</span> {row.payerKind}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <StageStatusBadge stage={row.stage} status={row.status} />
            <div className="flex w-56 justify-end">
              <AttentionSummary items={row.attention} />
            </div>
          </div>
        </div>

        <div className="text-muted-foreground flex items-center justify-between pt-0.5 text-xs">
          <div className="flex items-center gap-4">
            <span>{row.procedureName}</span>
            <ClockPair current={row.currentClock} compact />
          </div>

          <div>
            {row.assigneeName ? (
              <span className="text-muted-foreground">{row.assigneeName}</span>
            ) : (
              <span className="text-muted-foreground/60 italic">Unassigned</span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile view (< sm) */}
      <div className="space-y-2 sm:hidden">
        <div className="flex items-center justify-between">
          <span className="text-foreground font-mono text-sm font-semibold">{row.code}</span>
          <StageStatusBadge stage={row.stage} status={row.status} />
        </div>

        <div>
          <p className="text-foreground text-sm font-medium">{row.patientName}</p>
          <p className="text-muted-foreground text-xs">
            {row.payerName} · {row.procedureName}
          </p>
        </div>

        <div className="border-border/40 flex items-center justify-between border-t pt-1 text-xs">
          <AttentionSummary items={row.attention} />
          <ClockPair current={row.currentClock} compact />
        </div>
      </div>
    </Link>
  );
}
