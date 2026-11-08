import Link from "next/link";
import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PREAUTH_FIELDS } from "../domain/preauth-fields";
import type { FieldView } from "../domain/field-states";
import { FieldRow } from "./field-row";

const GROUPS = ["Patient", "Policy", "Admission", "Clinical", "Cost"] as const;

export function PreauthForm({
  claimCode,
  views,
  progress,
}: {
  claimCode: string;
  views: FieldView[];
  progress: { confirmed: number; total: number };
}) {
  const viewsByKey = new Map(views.map((v) => [v.key, v]));
  const pct = Math.round((progress.confirmed / progress.total) * 100);

  return (
    <div className="space-y-6">
      <div className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-foreground text-sm font-semibold">Pre-authorization form</h2>
            <span className="text-foreground font-mono text-xs font-medium">
              {progress.confirmed} of {progress.total} confirmed
            </span>
          </div>

          <div className="bg-secondary h-2 w-48 overflow-hidden rounded-full">
            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <Link
          href={`/api/claims/${claimCode}/packet`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 text-xs")}
        >
          <Download className="mr-1.5 size-3.5" />
          Download packet
        </Link>
      </div>

      <div className="space-y-6">
        {GROUPS.map((group) => {
          const groupFields = PREAUTH_FIELDS.filter((f) => f.group === group);
          return (
            <div key={group} className="space-y-3">
              <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {group} details
              </h3>

              <div className="space-y-2">
                {groupFields.map((field) => {
                  const view = viewsByKey.get(field.key) ?? {
                    key: field.key,
                    state: "EMPTY",
                  };
                  return <FieldRow key={field.key} field={field} view={view} claimCode={claimCode} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
