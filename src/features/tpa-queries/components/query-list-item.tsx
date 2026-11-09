import Link from "next/link";
import { cn } from "cn";
import type { InboxFilter } from "../domain/inbox-filter";
import { CountdownChip } from "./countdown-chip";

export type InboxRow = {
  id: string;
  fromAddress: string;
  subject: string;
  summary: string | null;
  extractedPatient: string | null;
  deadlineAt: Date;
  repliedAt: Date | null;
  payer: { name: string; kind: string } | null;
  claim: { code: string; patient: { name: string } } | null;
  suggestedClaim: { code: string; patient: { name: string } } | null;
  asks: Array<{ id: string; text: string }>;
};

export function QueryListItem({
  query,
  selected,
  filter,
}: {
  query: InboxRow;
  selected: boolean;
  filter: InboxFilter;
}) {
  const payerTitle = query.payer?.name ?? query.fromAddress;

  return (
    <Link
      href={`/inbox/${query.id}?filter=${filter}`}
      className={cn(
        "block border-b p-3.5 text-xs transition-colors outline-none",
        selected
          ? "bg-accent/60 border-l-primary border-l-2"
          : "hover:bg-muted/40 border-l-2 border-l-transparent",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-foreground truncate font-semibold">{payerTitle}</span>
        <CountdownChip deadlineAt={query.deadlineAt} repliedAt={query.repliedAt} className="shrink-0" />
      </div>

      <div className="mt-1 flex items-center gap-1.5 text-xs">
        {query.claim ? (
          <span className="text-foreground font-medium">
            {query.claim.code} · {query.claim.patient.name}
          </span>
        ) : query.suggestedClaim ? (
          <span className="font-semibold text-amber-900">
            Suggested · {query.suggestedClaim.code} · {query.suggestedClaim.patient.name}
          </span>
        ) : (
          <span className="text-muted-foreground italic">
            Unmatched · {query.extractedPatient ?? "Unknown patient"}
          </span>
        )}
      </div>

      <p className="text-muted-foreground mt-1 line-clamp-2 text-[11px] leading-relaxed">
        {query.summary ?? query.subject}
      </p>

      {query.asks.length > 0 && (
        <div className="text-muted-foreground mt-1.5 flex items-center gap-2 text-[10px]">
          <span>
            {query.asks.length} {query.asks.length === 1 ? "ask" : "asks"}
          </span>
        </div>
      )}
    </Link>
  );
}
