"use client";

import { useOptimistic } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAction } from "@/hooks/use-action";
import { SCOPE_LABEL } from "../domain/labels";
import { setChecklistRule } from "../server/actions";
import type { RuleEditorRow } from "../server/queries";
import type { RuleScopeInput } from "../schemas";
import { RequirementChip } from "./requirement-chip";
import { RequirementToggle, type RequirementChoice } from "./requirement-toggle";

export function RuleRow({
  row,
  scope,
  isGlobal,
}: {
  row: RuleEditorRow;
  scope: RuleScopeInput;
  isGlobal: boolean;
}) {
  const { run, pending } = useAction(setChecklistRule, {
    success: (r) => `Saved · applies to ${r.affectedOpenClaims} open claims`,
  });

  const [optimistic, setOptimistic] = useOptimistic(
    {
      requirement: (row.atScope?.requirement ?? "INHERIT") as RequirementChoice,
      needsFreshCopy: row.atScope?.needsFreshCopy ?? false,
    },
    (_current, update: { requirement: RequirementChoice; needsFreshCopy: boolean }) => update,
  );

  const handleRequirementChange = (newReq: RequirementChoice) => {
    const updated = {
      requirement: newReq,
      needsFreshCopy: newReq === "INHERIT" || newReq === "NOT_NEEDED" ? false : optimistic.needsFreshCopy,
    };
    setOptimistic(updated);
    run({
      payerId: scope.payerId,
      procedureId: scope.procedureId,
      stage: scope.stage,
      documentTypeId: row.documentType.id,
      requirement: updated.requirement,
      needsFreshCopy: updated.needsFreshCopy,
    });
  };

  const handleFreshCopyChange = (checked: boolean) => {
    const updated = { ...optimistic, needsFreshCopy: checked };
    setOptimistic(updated);
    run({
      payerId: scope.payerId,
      procedureId: scope.procedureId,
      stage: scope.stage,
      documentTypeId: row.documentType.id,
      requirement: updated.requirement,
      needsFreshCopy: checked,
    });
  };

  const canBeFresh = optimistic.requirement === "REQUIRED" || optimistic.requirement === "OPTIONAL";

  return (
    <tr className="border-border/60 hover:bg-muted/30 border-b transition-colors">
      <td className="px-4 py-3">
        <p className="text-foreground text-sm font-medium">{row.documentType.label}</p>
        {row.inherited && optimistic.requirement === "INHERIT" && (
          <p className="text-muted-foreground text-xs">
            Inherits {row.inherited.requirement.toLowerCase()} from {SCOPE_LABEL[row.inherited.scope]}
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        <RequirementToggle
          value={optimistic.requirement}
          onChange={handleRequirementChange}
          disabled={pending}
          isGlobal={isGlobal}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`fresh-${row.documentType.id}`}
            checked={optimistic.needsFreshCopy}
            onCheckedChange={handleFreshCopyChange}
            disabled={pending || !canBeFresh}
          />
          <label
            htmlFor={`fresh-${row.documentType.id}`}
            className="text-muted-foreground cursor-pointer text-xs select-none"
          >
            Fresh copy
          </label>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <RequirementChip requirement={row.result} needsFreshCopy={row.atScope?.needsFreshCopy ?? false} />
      </td>
    </tr>
  );
}
