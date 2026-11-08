import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ClockReport } from "../domain/clocks";

export function ClockPair({
  current,
  report,
  compact = false,
  className,
}: {
  current?: ClockReport["current"] | null;
  report?: ClockReport;
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    if (!current) return null;
    const text =
      current.holder === "HOSPITAL"
        ? `With us ${formatDuration(current.sinceMs)}`
        : `With insurer ${formatDuration(current.sinceMs)}`;

    return <span className={cn("text-muted-foreground font-mono text-xs", className)}>{text}</span>;
  }

  // Non-compact: calculate totals
  if (!report) return null;
  const stages = Object.values(report.byStage);
  const totalHospital = stages.reduce((acc, s) => acc + (s?.hospitalMs ?? 0), 0);
  const totalPayer = stages.reduce((acc, s) => acc + (s?.payerMs ?? 0), 0);

  return (
    <div className={cn("text-muted-foreground inline-flex items-center gap-2 font-mono text-xs", className)}>
      <span>With us {formatDuration(totalHospital)}</span>
      <span className="text-border">·</span>
      <span>With insurer {formatDuration(totalPayer)}</span>
    </div>
  );
}
