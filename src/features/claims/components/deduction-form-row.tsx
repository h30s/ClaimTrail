"use client";

import type { UseFormRegister } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEDUCTION_REASON_LABEL } from "../domain/labels";
import type { RecordSettlementInput } from "../schemas";

const REASON_OPTIONS = Object.entries(DEDUCTION_REASON_LABEL).map(([key, label]) => ({
  value: key as keyof typeof DEDUCTION_REASON_LABEL,
  label,
}));

export function DeductionFormRow({
  index,
  onRemove,
  register,
}: {
  index: number;
  onRemove: () => void;
  register: UseFormRegister<RecordSettlementInput>;
}) {
  return (
    <div className="border-border bg-muted/20 flex items-start gap-2 rounded-md border p-2">
      <div className="flex-1 space-y-1.5">
        <div className="grid grid-cols-[1fr_120px] gap-2">
          <select
            {...register(`deductions.${index}.reason`)}
            aria-label={`Deduction ${index + 1} reason`}
            className="border-input bg-surface text-foreground rounded-md border px-2 py-1 text-xs"
          >
            {REASON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Input
            type="number"
            placeholder="Amount"
            aria-label={`Deduction ${index + 1} amount`}
            {...register(`deductions.${index}.amount`, { valueAsNumber: true })}
            className="font-mono text-xs"
          />
        </div>
        <Input
          placeholder="Note / detail (optional)"
          aria-label={`Deduction ${index + 1} note`}
          {...register(`deductions.${index}.note`)}
          className="text-xs"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remove deduction ${index + 1}`}
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive h-8 w-8 shrink-0"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
