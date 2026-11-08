import { Check, X } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MILESTONE_LABEL } from "../domain/labels";
import type { Milestone } from "../domain/milestones";

export function ClaimStepper({ milestones, className }: { milestones: Milestone[]; className?: string }) {
  return (
    <div className={cn("w-full overflow-x-auto py-2", className)}>
      <ol className="flex min-w-[560px] items-center gap-2 sm:gap-4">
        {milestones.map((step, idx) => {
          const isDone = step.state === "done";
          const isCurrent = step.state === "current";
          const isFailed = step.state === "failed";
          const isUpcoming = step.state === "upcoming";

          return (
            <li key={step.key} className="flex flex-1 items-center gap-2 last:flex-none">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                      isDone && "bg-primary text-primary-foreground",
                      isCurrent && "border-primary text-primary bg-surface border-2 font-semibold shadow-xs",
                      isFailed && "bg-danger text-danger-foreground",
                      isUpcoming && "border-border text-muted-foreground bg-muted/40 border",
                    )}
                  >
                    {isDone ? (
                      <Check className="size-3.5 stroke-[2.5]" />
                    ) : isFailed ? (
                      <X className="size-3.5 stroke-[2.5]" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  <span
                    className={cn(
                      "text-xs whitespace-nowrap",
                      isCurrent ? "text-foreground font-semibold" : "text-muted-foreground",
                      isFailed && "text-danger font-medium",
                    )}
                  >
                    {MILESTONE_LABEL[step.key]}
                  </span>
                </div>

                {step.at && (
                  <span className="text-muted-foreground/75 pl-8 font-mono text-[10px]">
                    {formatDateTime(step.at)}
                  </span>
                )}
              </div>

              {idx < milestones.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 min-w-4 flex-1 transition-colors",
                    isDone ? "bg-primary" : "bg-border/80",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
