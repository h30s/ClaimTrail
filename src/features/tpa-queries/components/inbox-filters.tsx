import Link from "next/link";
import { cn } from "cn";
import type { InboxFilter } from "../domain/inbox-filter";

type FilterCounts = {
  open: number;
  dueToday: number;
  overdue: number;
  unmatched: number;
  answered: number;
};

const FILTERS: Array<{ id: InboxFilter; label: string; countKey: keyof FilterCounts }> = [
  { id: "open", label: "Open", countKey: "open" },
  { id: "due-today", label: "Due today", countKey: "dueToday" },
  { id: "overdue", label: "Overdue", countKey: "overdue" },
  { id: "unmatched", label: "Unmatched", countKey: "unmatched" },
  { id: "answered", label: "Answered", countKey: "answered" },
];

export function InboxFilters({
  currentFilter,
  counts,
}: {
  currentFilter: InboxFilter;
  counts: FilterCounts;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b px-4 py-2.5">
      {FILTERS.map((f) => {
        const isActive = currentFilter === f.id;
        const count = counts[f.countKey];
        const isOverdue = f.id === "overdue" && count > 0;

        return (
          <Link
            key={f.id}
            href={`/inbox?filter=${f.id}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <span>{f.label}</span>
            <span
              className={cn(
                "py-0.2 rounded-full px-1.5 text-[10px]",
                isActive
                  ? "text-primary-foreground bg-white/20"
                  : isOverdue
                    ? "bg-destructive/10 text-destructive font-semibold"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
