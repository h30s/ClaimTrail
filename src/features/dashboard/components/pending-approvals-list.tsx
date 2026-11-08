import Link from "next/link";
import { AlertCircle, Clock, Sparkles } from "lucide-react";
import { formatDuration } from "@/lib/format";
import type { PendingApprovalItem } from "../domain/metrics";

export function PendingApprovalsList({
  items,
  aiSorting,
}: {
  items: PendingApprovalItem[];
  aiSorting: { total: number; aiSorted: number; rate: number };
}) {
  const topItems = items.slice(0, 8);

  return (
    <div className="border-border bg-surface flex flex-col justify-between rounded-lg border p-4 shadow-2xs">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-foreground text-sm font-semibold">Pending Insurer Approvals</h3>
            <p className="text-muted-foreground text-xs">Awaiting decision from payer</p>
          </div>
          <span className="border-border bg-muted/40 text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs">
            {items.length} pending
          </span>
        </div>

        {topItems.length === 0 ? (
          <p className="border-border text-muted-foreground rounded-md border border-dashed py-8 text-center text-xs">
            No claims currently pending insurer decision.
          </p>
        ) : (
          <div className="divide-border/60 divide-y">
            {topItems.map((item) => (
              <div
                key={item.code}
                className="hover:bg-muted/30 -mx-1 flex flex-col gap-1 rounded-md px-1 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/claims/${item.code}`}
                      className="text-foreground hover:text-primary font-mono text-xs font-semibold hover:underline"
                    >
                      {item.code}
                    </Link>
                    <span className="text-muted-foreground/60 text-xs">·</span>
                    <span className="text-foreground truncate text-xs font-medium">{item.patientName}</span>
                  </div>
                  <p className="text-muted-foreground truncate text-[11px]">{item.payerName}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Clock className="text-muted-foreground/70 size-3" />
                    <span>with insurer {formatDuration(item.sinceMs)}</span>
                  </span>

                  {item.pastTarget && (
                    <span className="text-danger bg-danger-soft border-danger/30 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium">
                      <AlertCircle className="size-3" />
                      <span>past IRDAI</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-border bg-muted/20 mt-4 flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
        <Sparkles className="text-primary size-3.5 shrink-0" />
        <span className="text-muted-foreground">
          AI sorting:{" "}
          <strong className="text-foreground font-medium">
            {aiSorting.rate}% of AI-filed documents not moved
          </strong>{" "}
          ({aiSorting.aiSorted} of {aiSorting.total} files)
        </span>
      </div>
    </div>
  );
}
