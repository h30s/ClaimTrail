"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { applyFieldErrors } from "@/hooks/apply-field-errors";
import { useAction } from "@/hooks/use-action";
import { RecordDecisionSchema, type RecordDecisionInput } from "../schemas";
import { recordDecision } from "../server/actions";

export function RecordDecisionDialog({
  claimId,
  estimatedAmount,
  open,
  onOpenChange,
  initialDecision = "APPROVE",
}: {
  claimId: string;
  estimatedAmount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDecision?: "APPROVE" | "REJECT";
}) {
  const [decision, setDecision] = useState<"APPROVE" | "REJECT">(initialDecision);

  const { run, pending } = useAction(recordDecision, {
    success: decision === "APPROVE" ? "Approval recorded" : "Rejection recorded",
    onSuccess: () => onOpenChange(false),
  });

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
  } = useForm<RecordDecisionInput>({
    resolver: zodResolver(RecordDecisionSchema),
    defaultValues: {
      claimId,
      decision: initialDecision,
      approvedAmount: estimatedAmount,
      reason: "",
    },
  });

  const currentDecision = useWatch({ control, name: "decision" });

  const switchDecision = (next: "APPROVE" | "REJECT") => {
    setDecision(next);
    setValue("decision", next);
  };

  const onSubmit = async (data: RecordDecisionInput) => {
    const res = await run(data);
    if (!res.ok && res.fieldErrors) {
      applyFieldErrors(setError, res.fieldErrors);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Record Insurer Decision</DialogTitle>
            <DialogDescription className="text-xs">
              Record the insurer&apos;s pre-auth or enhancement decision.
            </DialogDescription>
          </DialogHeader>

          <div className="border-border bg-muted/30 flex rounded-lg border p-1">
            <button
              type="button"
              onClick={() => switchDecision("APPROVE")}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                currentDecision === "APPROVE"
                  ? "bg-surface text-success font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Approve Cashless
            </button>
            <button
              type="button"
              onClick={() => switchDecision("REJECT")}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                currentDecision === "REJECT"
                  ? "bg-surface text-danger font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Reject Cashless
            </button>
          </div>

          {currentDecision === "APPROVE" ? (
            <div className="space-y-1.5">
              <Label htmlFor="approvedAmount" className="text-xs">
                Approved Amount (₹)
              </Label>
              <Input
                id="approvedAmount"
                type="number"
                className="h-8 font-mono text-xs"
                {...register("approvedAmount", { valueAsNumber: true })}
              />
              {errors.approvedAmount?.message && (
                <p className="text-danger text-xs">{errors.approvedAmount.message}</p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-xs">
                Rejection Reason (from insurer letter)
              </Label>
              <Textarea
                id="reason"
                rows={3}
                placeholder="e.g. Waiting period for pre-existing disease not completed."
                className="resize-none text-xs"
                {...register("reason")}
              />
              {errors.reason?.message && <p className="text-danger text-xs">{errors.reason.message}</p>}
            </div>
          )}

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={pending}
              variant={currentDecision === "APPROVE" ? "default" : "destructive"}
            >
              {pending
                ? "Recording…"
                : currentDecision === "APPROVE"
                  ? "Record Approval"
                  : "Record Rejection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
