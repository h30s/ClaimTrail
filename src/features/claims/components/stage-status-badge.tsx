import { Badge } from "@/components/ui/badge";
import type { ClaimStatus, Stage } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { stageStatusLabel } from "../domain/labels";

export function StageStatusBadge({
  stage,
  status,
  className,
}: {
  stage: Stage;
  status: ClaimStatus;
  className?: string;
}) {
  const dotColor =
    status === "QUERY"
      ? "bg-warning"
      : status === "REJECTED"
        ? "bg-danger"
        : status === "APPROVED" || status === "SETTLED"
          ? "bg-success"
          : status === "SENT"
            ? "bg-primary"
            : "bg-muted-foreground";

  return (
    <Badge
      variant="outline"
      className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-normal", className)}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", dotColor)} />
      <span>{stageStatusLabel(stage, status)}</span>
    </Badge>
  );
}
