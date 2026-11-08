import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { CountdownChip } from "./countdown-chip";

export function OpenQueryCard({
  query,
}: {
  query: {
    id: string;
    deadlineAt: Date;
    receivedAt: Date;
    summary: string | null;
    subject: string;
    payerName?: string;
  };
}) {
  return (
    <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-100">
          <HelpCircle className="size-3.5 text-amber-600 dark:text-amber-400" />
          <span>Active TPA Query</span>
        </div>
        <CountdownChip deadlineAt={query.deadlineAt} />
      </div>

      <p className="text-muted-foreground line-clamp-2 text-[11px]">{query.summary ?? query.subject}</p>

      <div className="flex items-center justify-between border-t border-amber-500/10 pt-1 text-[11px]">
        <span className="text-muted-foreground">Received {formatDateTime(query.receivedAt)}</span>
        <Link
          href={`/inbox/${query.id}`}
          className="text-primary inline-flex items-center gap-1 font-medium hover:underline"
        >
          <span>Open in inbox</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
