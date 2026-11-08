import { formatDateTime } from "@/lib/format";
import { EVENT_LABEL } from "../domain/labels";
import type { ClaimTimelineEventDto } from "../types";

export function EventList({ events }: { events: ClaimTimelineEventDto[] }) {
  if (events.length === 0) {
    return (
      <div className="border-border text-muted-foreground rounded-lg border border-dashed py-8 text-center text-xs">
        No recorded events yet.
      </div>
    );
  }

  return (
    <div className="border-border bg-surface rounded-lg border p-4">
      <h2 className="text-foreground mb-4 text-sm font-semibold">Activity Log</h2>
      <ol className="border-border relative ml-2 space-y-4 border-l">
        {events.map((e) => (
          <li key={e.id} className="ml-4">
            <span className="border-surface bg-primary absolute -left-1.5 mt-1.5 size-3 rounded-full border-2" />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-foreground text-sm font-medium">{EVENT_LABEL[e.type] ?? e.type}</span>
                <span className="text-muted-foreground font-mono text-xs">{formatDateTime(e.at)}</span>
              </div>

              {e.actorName && (
                <p className="text-muted-foreground text-xs">
                  Performed by <span className="text-foreground font-medium">{e.actorName}</span>
                </p>
              )}

              {e.note && (
                <div className="bg-muted/40 text-foreground mt-1 rounded-md p-2 text-xs">
                  <p className="italic">&ldquo;{e.note}&rdquo;</p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
