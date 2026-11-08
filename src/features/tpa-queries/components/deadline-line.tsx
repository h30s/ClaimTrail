import { formatDateTime } from "@/lib/format";
import { CountdownChip } from "./countdown-chip";

export function DeadlineLine({
  deadlineAt,
  deadlineSource,
  deadlineSnippet,
  repliedAt,
  payerName,
  replyHours,
}: {
  deadlineAt: Date;
  deadlineSource: "STATED" | "DEFAULT";
  deadlineSnippet: string | null;
  repliedAt: Date | null;
  payerName?: string;
  replyHours?: number;
}) {
  return (
    <div className="bg-surface flex flex-col gap-1 rounded-lg border p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="text-foreground font-medium">Due {formatDateTime(deadlineAt)}</span>
        <CountdownChip deadlineAt={deadlineAt} repliedAt={repliedAt} />
      </div>

      <p className="text-muted-foreground text-[11px] italic">
        {deadlineSource === "STATED" && deadlineSnippet
          ? `stated in email: "${deadlineSnippet}"`
          : `Default ${replyHours ?? 24} h for ${payerName ?? "insurer"} — no deadline stated`}
      </p>
    </div>
  );
}
