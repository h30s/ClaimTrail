"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitDoctorDecision } from "../server/actions";

export function DoctorDecisionForm({ token, doctorName }: { token: string; doctorName: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [decided, setDecided] = useState<"APPROVED" | "CHANGES_REQUESTED" | null>(null);
  const [showChangesBox, setShowChangesBox] = useState(false);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleDecision = async (decision: "APPROVE" | "CHANGES_REQUESTED") => {
    if (decision === "CHANGES_REQUESTED" && !comment.trim()) {
      setError("Please describe what needs to be changed in the notes.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const res = await submitDoctorDecision({
      token,
      decision,
      comment: decision === "CHANGES_REQUESTED" ? comment : undefined,
    });

    setSubmitting(false);

    if (res.ok) {
      setDecided(decision === "APPROVE" ? "APPROVED" : "CHANGES_REQUESTED");
    } else {
      setError(res.error || "Unable to submit decision. Please try again.");
    }
  };

  if (decided === "APPROVED") {
    return (
      <div className="border-success/30 bg-success-soft space-y-2 rounded-xl border p-6 text-center">
        <CheckCircle2 className="text-success mx-auto size-10" />
        <h3 className="text-foreground text-lg font-bold">Notes Approved</h3>
        <p className="text-muted-foreground text-sm">
          Thank you, {doctorName}. Your sign-off has been recorded and the cashless desk has been notified.
        </p>
      </div>
    );
  }

  if (decided === "CHANGES_REQUESTED") {
    return (
      <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-6 text-center">
        <MessageSquare className="mx-auto size-10 text-amber-700" />
        <h3 className="text-foreground text-lg font-bold">Change Request Sent</h3>
        <p className="text-muted-foreground text-sm">
          Your feedback has been sent to the insurance desk to update the indoor papers before submission.
        </p>
      </div>
    );
  }

  return (
    <div className="border-border space-y-4 border-t pt-4">
      {error && (
        <div className="border-danger/30 bg-danger-soft text-danger rounded-lg border p-3 text-sm">
          {error}
        </div>
      )}

      {!showChangesBox ? (
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            size="lg"
            disabled={submitting}
            onClick={() => handleDecision("APPROVE")}
            className="h-12 w-full text-base font-semibold shadow-xs"
          >
            <CheckCircle2 className="mr-2 size-5" />
            <span>{submitting ? "Submitting…" : "Approve Clinical Notes"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => setShowChangesBox(true)}
            className="h-11 w-full text-sm font-medium"
          >
            <MessageSquare className="mr-2 size-4" />
            <span>Request Changes to Notes</span>
          </Button>
        </div>
      ) : (
        <div className="border-border bg-muted/20 space-y-3 rounded-lg border p-4">
          <label htmlFor="doctor-feedback" className="text-foreground block text-sm font-semibold">
            What needs to be revised?
          </label>
          <Textarea
            id="doctor-feedback"
            placeholder="e.g. Please update duration of pain to 3 days instead of 3 weeks..."
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="bg-surface text-sm"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowChangesBox(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={submitting || !comment.trim()}
              onClick={() => handleDecision("CHANGES_REQUESTED")}
              className="flex-1 gap-1"
            >
              <Send className="size-3.5" />
              <span>{submitting ? "Sending…" : "Submit Request"}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
