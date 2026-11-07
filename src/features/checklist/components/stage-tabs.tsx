import Link from "next/link";
import { cn } from "cn";
import type { Stage } from "@/lib/enums";
import { STAGE_LABEL } from "../domain/labels";

const STAGES: Stage[] = ["PRE_AUTH", "ENHANCEMENT", "DISCHARGE"];

export function StageTabs({
  currentStage,
  searchParams,
}: {
  currentStage: Stage;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <div className="border-border flex border-b">
      {STAGES.map((stage) => {
        const isActive = stage === currentStage;
        const params = new URLSearchParams();
        for (const [key, val] of Object.entries(searchParams)) {
          if (typeof val === "string" && key !== "stage") {
            params.set(key, val);
          }
        }
        params.set("stage", stage);

        return (
          <Link
            key={stage}
            href={`/settings/checklists?${params.toString()}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground hover:border-border border-transparent",
            )}
          >
            {STAGE_LABEL[stage]}
          </Link>
        );
      })}
    </div>
  );
}
