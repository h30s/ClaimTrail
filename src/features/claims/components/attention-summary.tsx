import { cn } from "@/lib/utils";
import type { AttentionItem } from "../domain/urgency";

export function AttentionSummary({ items, className }: { items: AttentionItem[]; className?: string }) {
  if (items.length === 0) return null;

  const top = items[0]!;
  const more = items.length - 1;

  const dotColor =
    top.severity === "critical"
      ? "bg-danger"
      : top.severity === "warning"
        ? "bg-warning"
        : "bg-muted-foreground";

  return (
    <div className={cn("inline-flex items-center gap-1.5 text-xs", className)}>
      <span className={cn("size-2 shrink-0 rounded-full", dotColor)} />
      <span className="text-foreground max-w-[280px] truncate font-medium">{top.label}</span>
      {more > 0 && <span className="text-muted-foreground shrink-0 font-mono text-[11px]">+{more}</span>}
    </div>
  );
}
