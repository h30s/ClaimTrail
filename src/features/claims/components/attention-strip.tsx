import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttentionItem } from "../domain/urgency";

export function AttentionStrip({
  items,
  readyLine,
  className,
}: {
  items: AttentionItem[];
  readyLine: string;
  className?: string;
}) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          "border-success/30 bg-success-soft/30 text-foreground flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs",
          className,
        )}
      >
        <CheckCircle2 className="text-success size-4 shrink-0" />
        <span className="font-medium">{readyLine}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-border bg-surface flex flex-wrap items-center gap-2 rounded-lg border p-2.5",
        className,
      )}
    >
      {items.map((item, idx) => {
        const dotColor =
          item.severity === "critical"
            ? "bg-danger"
            : item.severity === "warning"
              ? "bg-warning"
              : "bg-muted-foreground";

        const bgHover =
          item.severity === "critical"
            ? "hover:border-danger/40 hover:bg-danger-soft/20"
            : item.severity === "warning"
              ? "hover:border-warning/40 hover:bg-warning-soft/20"
              : "hover:border-border hover:bg-muted/40";

        return (
          <a
            key={idx}
            href={item.anchor}
            className={cn(
              "border-border/80 bg-background text-foreground inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs shadow-2xs transition-colors",
              bgHover,
            )}
          >
            <span className={cn("size-2 shrink-0 rounded-full", dotColor)} />
            <span className="font-medium">{item.label}</span>
          </a>
        );
      })}
    </div>
  );
}
