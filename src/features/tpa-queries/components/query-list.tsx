import type { InboxFilter } from "../domain/inbox-filter";
import { QueryListItem, type InboxRow } from "./query-list-item";

const EMPTY_MESSAGES: Record<InboxFilter, string> = {
  open: "No open queries. Replies are all in.",
  "due-today": "No queries due today.",
  overdue: "No overdue queries. All on schedule.",
  unmatched: "No unmatched emails waiting to be linked.",
  answered: "No answered queries recorded yet.",
};

export function QueryList({
  queries,
  selectedId,
  filter,
}: {
  queries: InboxRow[];
  selectedId?: string;
  filter: InboxFilter;
}) {
  if (queries.length === 0) {
    return (
      <div className="text-muted-foreground flex h-64 flex-col items-center justify-center p-6 text-center text-xs">
        <p>{EMPTY_MESSAGES[filter] ?? "No queries found."}</p>
      </div>
    );
  }

  return (
    <div className="divide-border divide-y">
      {queries.map((q) => (
        <QueryListItem key={q.id} query={q} selected={q.id === selectedId} filter={filter} />
      ))}
    </div>
  );
}
