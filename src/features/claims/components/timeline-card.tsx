import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import { EVENT_LABEL } from "../domain/labels";
import type { ClaimTimelineEventDto } from "../types";

export function TimelineCard({ code, events }: { code: string; events: ClaimTimelineEventDto[] }) {
  return (
    <div className="border-border bg-surface space-y-3 rounded-lg border p-4">
      <div className="border-border flex items-center justify-between border-b pb-2">
        <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Recent Activity
        </h3>
        <Link href={`/claims/${code}/activity`} className="text-primary text-xs font-medium hover:underline">
          See all →
        </Link>
      </div>

      <ol className="border-border/80 relative ml-2 space-y-3 border-l">
        {events.map((e) => (
          <li key={e.id} className="ml-3">
            <span className="border-surface bg-primary absolute -left-1.5 mt-1.5 size-3 rounded-full border-2" />
            <div className="flex flex-col">
              <span className="text-foreground text-xs font-medium">{EVENT_LABEL[e.type] ?? e.type}</span>
              <span className="text-muted-foreground font-mono text-[10px]">
                {formatDateTime(e.at)} {e.actorName ? `· ${e.actorName}` : ""}
              </span>
              {e.note && (
                <p className="text-muted-foreground mt-0.5 text-xs italic">&ldquo;{e.note}&rdquo;</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
