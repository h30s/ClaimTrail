"use client";

import { useEffect, useState } from "react";
import { AlertCircle, FileDown, Loader2 } from "lucide-react";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "@/hooks/use-action";
import type { Stage } from "@/lib/enums";
import { getSubmissionCheckAction, submitClaim } from "../server/actions";
import type { SubmissionCheck } from "../server/submission-check";

const STAGE_LABELS: Record<Stage, string> = {
  PRE_AUTH: "pre-auth",
  ENHANCEMENT: "enhancement",
  DISCHARGE: "discharge",
};

export type PrepareSubmissionDialogProps = {
  claimCode: string;
  payerName: string;
  stage: Stage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isHead: boolean;
};

export function PrepareSubmissionDialog(props: PrepareSubmissionDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {props.open && <SubmissionDialogBody {...props} />}
      </DialogContent>
    </Dialog>
  );
}

function SubmissionDialogBody({
  claimCode,
  payerName,
  stage,
  onOpenChange,
  isHead,
}: PrepareSubmissionDialogProps) {
  const [check, setCheck] = useState<SubmissionCheck | null>(null);
  const [sendWithGaps, setSendWithGaps] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");

  const { run: runSubmit, pending: submitting } = useAction(submitClaim, {
    success: `Claim marked as sent to ${payerName}`,
    onSuccess: () => onOpenChange(false),
  });

  useEffect(() => {
    let cancelled = false;
    getSubmissionCheckAction({ claimCode }).then((res) => {
      if (!cancelled && res.ok) setCheck(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [claimCode]);

  const loading = check === null;
  const hasGaps = (check?.blockingItems.length ?? 0) > 0;
  const canSend = !hasGaps || (isHead && sendWithGaps && overrideReason.trim().length >= 10);

  const onSubmit = () => {
    if (!canSend) return;
    runSubmit({
      claimCode,
      overrideReason: sendWithGaps ? overrideReason.trim() : undefined,
    });
  };

  const reqSlots = check?.gaps.slots.filter((s) => s.item.requirement === "REQUIRED") ?? [];
  const satisfiedReq = reqSlots.filter((s) => s.state === "SATISFIED").length;

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          Send {STAGE_LABELS[stage]} to {payerName}
        </DialogTitle>
        <DialogDescription>Review requirements and packet before marking as sent.</DialogDescription>
      </DialogHeader>

      {loading ? (
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-xs">
          <Loader2 className="size-4 animate-spin" />
          <span>Checking submission requirements…</span>
        </div>
      ) : (
        <div className="space-y-3.5 text-xs">
          <div className="space-y-1.5 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Checklist</span>
              <span
                className={cn(
                  satisfiedReq === reqSlots.length ? "text-success" : "font-semibold text-amber-800",
                )}
              >
                {satisfiedReq} of {reqSlots.length} required
              </span>
            </div>
            {check?.fields && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Pre-auth fields</span>
                <span
                  className={cn(
                    check.fields.confirmed === check.fields.total
                      ? "text-success"
                      : "font-semibold text-amber-800",
                  )}
                >
                  {check.fields.confirmed} of {check.fields.total} confirmed
                </span>
              </div>
            )}
          </div>

          {hasGaps && (
            <div className="space-y-1.5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-950 shadow-xs">
              <div className="flex items-center gap-1.5 font-semibold text-amber-950">
                <AlertCircle className="size-4 shrink-0 text-amber-700" />
                <span>Missing or blocking items ({check?.blockingItems.length})</span>
              </div>
              <ul className="list-disc space-y-0.5 pl-4 text-xs font-medium text-amber-900">
                {check?.blockingItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-1.5 pt-1">
            <a
              href={`/api/claims/${claimCode}/packet?stage=${stage}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center gap-2")}
            >
              <FileDown className="size-4" />
              <span>Download packet (PDF, {check?.packet.pageCount ?? 1} pages)</span>
            </a>
            <p className="text-muted-foreground text-center text-[11px]">
              After you email it from your mail client, mark it as sent.
            </p>
          </div>

          {hasGaps && isHead && (
            <div className="space-y-2 rounded-lg border p-3">
              <label className="flex cursor-pointer items-center gap-2 font-medium">
                <Checkbox checked={sendWithGaps} onCheckedChange={(val) => setSendWithGaps(Boolean(val))} />
                <span>Send with gaps (desk head override)</span>
              </label>
              {sendWithGaps && (
                <div className="space-y-1">
                  <Textarea
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Reason for sending with gaps (required, 10–300 characters)…"
                    rows={2}
                    maxLength={300}
                  />
                  <div className="text-muted-foreground flex justify-between text-[11px]">
                    <span>{overrideReason.trim().length < 10 ? "Min 10 characters required" : "Ready"}</span>
                    <span>{overrideReason.length}/300</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {hasGaps && !isHead && (
            <p className="text-muted-foreground text-[11px]">
              Upload the missing items or ask the desk head to approve sending with gaps.
            </p>
          )}
        </div>
      )}

      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button size="sm" disabled={loading || submitting || !canSend} onClick={onSubmit}>
          {submitting
            ? "Sending…"
            : sendWithGaps
              ? "Submit with head override"
              : `Mark as sent to ${payerName}`}
        </Button>
      </DialogFooter>
    </>
  );
}
