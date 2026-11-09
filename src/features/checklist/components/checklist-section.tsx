import { AlertCircle, AlertTriangle, CheckCircle2, Circle } from "lucide-react";
import type { Stage } from "@/lib/enums";
import type { GapReport, SlotState } from "../domain/compute-gaps";
import { SCOPE_LABEL } from "../domain/labels";
import { RequirementChip } from "./requirement-chip";

function SlotStateIcon({ state, required }: { state: SlotState; required: boolean }) {
  if (state === "SATISFIED") {
    return <CheckCircle2 className="text-success size-4 shrink-0" />;
  }
  if (state === "NEEDS_CHECK") {
    return <AlertTriangle className="text-danger size-4 shrink-0" />;
  }
  if (state === "STALE") {
    return <AlertCircle className="size-4 shrink-0 text-amber-700" />;
  }
  return required ? (
    <Circle className="text-danger size-4 shrink-0" />
  ) : (
    <Circle className="text-muted-foreground size-4 shrink-0" />
  );
}

export function ChecklistSection({
  gaps,
  stage,
  payerName,
  procedureName,
  docTypeLabels,
}: {
  gaps: GapReport;
  stage: Stage;
  payerName: string;
  procedureName: string;
  docTypeLabels: Record<string, string>;
}) {
  const satisfiedCount = gaps.slots.filter((s) => s.state === "SATISFIED").length;
  const totalCount = gaps.slots.length;

  return (
    <div className="border-border bg-surface space-y-3 rounded-lg border p-4">
      <div className="border-border flex items-center justify-between border-b pb-2">
        <div>
          <h2 className="text-foreground text-sm font-semibold">
            {stage === "PRE_AUTH"
              ? "Pre-auth checklist"
              : stage === "ENHANCEMENT"
                ? "Enhancement checklist"
                : "Final bill checklist"}
          </h2>
          <p className="text-muted-foreground text-xs">
            {payerName} · {procedureName}
          </p>
        </div>

        <span className="text-foreground font-mono text-xs font-medium">
          {satisfiedCount} of {totalCount}
        </span>
      </div>

      {gaps.slots.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center text-xs">Nothing required for this stage.</div>
      ) : (
        <div className="divide-border/60 divide-y">
          {gaps.slots.map((slot) => {
            const label = docTypeLabels[slot.item.documentTypeId] ?? slot.item.documentTypeId;
            const isReq = slot.item.requirement === "REQUIRED";

            return (
              <div
                key={slot.item.documentTypeId}
                className="flex flex-col gap-2 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <SlotStateIcon state={slot.state} required={isReq} />
                  <span className="text-foreground truncate font-medium">{label}</span>
                  <RequirementChip
                    requirement={slot.item.requirement}
                    needsFreshCopy={slot.item.needsFreshCopy}
                  />
                  <span className="text-muted-foreground/80 hidden font-mono text-[10px] sm:inline">
                    ⓘ {SCOPE_LABEL[slot.item.source.scope]}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2 text-right">
                  {slot.state === "SATISFIED" && (
                    <span className="text-success text-xs font-medium">Present</span>
                  )}
                  {slot.state === "MISSING" && (
                    <span className="text-danger text-xs font-medium">Missing</span>
                  )}
                  {slot.state === "STALE" && (
                    <span className="text-xs font-semibold text-amber-800">Fresh copy needed</span>
                  )}
                  {slot.state === "NEEDS_CHECK" && (
                    <span className="text-danger text-xs font-medium">Name mismatch</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
