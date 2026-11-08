"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { applyFieldErrors } from "@/hooks/apply-field-errors";
import { useAction } from "@/hooks/use-action";
import { RecordSettlementSchema, type RecordSettlementInput } from "../schemas";
import { recordSettlement } from "../server/actions";
import { DeductionFormRow } from "./deduction-form-row";

export function RecordSettlementDialog({
  claimCode,
  defaultBilled,
  defaultSettled,
  open,
  onOpenChange,
}: {
  claimCode: string;
  defaultBilled?: number | null;
  defaultSettled?: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { run, pending } = useAction(recordSettlement, {
    success: "Settlement recorded",
    onSuccess: () => onOpenChange(false),
  });

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RecordSettlementInput>({
    resolver: zodResolver(RecordSettlementSchema),
    defaultValues: {
      claimCode,
      billedAmount: defaultBilled ?? 0,
      settledAmount: defaultSettled ?? defaultBilled ?? 0,
      deductions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "deductions" });
  const watchBilled = useWatch({ control, name: "billedAmount" });
  const watchSettled = useWatch({ control, name: "settledAmount" });
  const watchDeductions = useWatch({ control, name: "deductions" });

  const billed = Number(watchBilled) || 0;
  const settled = Number(watchSettled) || 0;
  const diff = billed - settled;
  const sumDeductions = (watchDeductions || []).reduce((acc, d) => acc + (Number(d?.amount) || 0), 0);
  const remaining = diff - sumDeductions;

  const onSubmit = async (data: RecordSettlementInput) => {
    const res = await run(data);
    if (!res.ok && res.fieldErrors) {
      applyFieldErrors(setError, res.fieldErrors);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Record Claim Settlement</DialogTitle>
            <DialogDescription className="text-xs">
              Enter the final hospital bill and the settled amount from the insurer. Itemize any deductions.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="billedAmount" className="text-xs">
                Final Billed Amount (₹)
              </Label>
              <Input
                id="billedAmount"
                type="number"
                {...register("billedAmount", { valueAsNumber: true })}
                className="font-mono text-sm"
              />
              {errors.billedAmount && (
                <p className="text-destructive text-xs">{errors.billedAmount.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="settledAmount" className="text-xs">
                Settled Amount (₹)
              </Label>
              <Input
                id="settledAmount"
                type="number"
                {...register("settledAmount", { valueAsNumber: true })}
                className="font-mono text-sm"
              />
              {errors.settledAmount && (
                <p className="text-destructive text-xs">{errors.settledAmount.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Deduction Breakdown</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    reason: "MISSING_DOCUMENT",
                    amount: remaining > 0 ? remaining : 0,
                    note: "",
                  })
                }
                className="h-7 gap-1 text-xs"
              >
                <Plus className="size-3" />
                <span>Add line</span>
              </Button>
            </div>

            {fields.length === 0 ? (
              <p className="border-border text-muted-foreground rounded-md border border-dashed py-3 text-center text-xs">
                {diff === 0
                  ? "Zero deductions: claim settled in full."
                  : `₹${diff.toLocaleString("en-IN")} difference between billed and settled. Add deduction lines.`}
              </p>
            ) : (
              <div className="space-y-2">
                {fields.map((field, idx) => (
                  <DeductionFormRow
                    key={field.id}
                    index={idx}
                    register={register}
                    onRemove={() => remove(idx)}
                  />
                ))}
              </div>
            )}

            <div className="border-border bg-muted/40 flex items-center justify-between rounded-md border px-3 py-2 text-xs">
              <span className="text-muted-foreground">
                Difference:{" "}
                <strong className="text-foreground font-mono">₹{diff.toLocaleString("en-IN")}</strong>
              </span>
              <span
                className={`font-medium ${
                  remaining === 0 ? "text-success" : remaining > 0 ? "text-warning" : "text-destructive"
                }`}
              >
                {remaining === 0
                  ? "✓ Fully accounted for"
                  : remaining > 0
                    ? `Remaining to explain: ₹${remaining.toLocaleString("en-IN")}`
                    : `Over-accounted by ₹${(-remaining).toLocaleString("en-IN")}`}
              </span>
            </div>

            {errors.deductions?.message && (
              <p className="text-destructive text-xs">{errors.deductions.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={pending || remaining !== 0 || diff < 0}>
              {pending ? "Recording…" : "Save Settlement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
