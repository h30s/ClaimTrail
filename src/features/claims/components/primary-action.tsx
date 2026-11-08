"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import type { ClaimFileDto } from "../types";
import { startStage } from "../server/actions";
import { RecordDecisionDialog } from "./record-decision-dialog";

export function PrimaryAction({ file }: { file: ClaimFileDto }) {
  const [decisionOpen, setDecisionOpen] = useState(false);
  const { status, stage } = file.claim;

  const { run: runStartStage, pending: stagePending } = useAction(startStage, {
    success: "Stage started",
  });

  if (status === "SENT") {
    return (
      <>
        <Button size="sm" onClick={() => setDecisionOpen(true)} className="gap-1.5">
          <span>Record decision</span>
          <ArrowRight className="size-3.5" />
        </Button>
        <RecordDecisionDialog
          claimId={file.claim.id}
          estimatedAmount={file.claim.estimatedAmount}
          open={decisionOpen}
          onOpenChange={setDecisionOpen}
        />
      </>
    );
  }

  if (status === "APPROVED" && stage !== "DISCHARGE") {
    return (
      <Button
        size="sm"
        disabled={stagePending}
        onClick={() => runStartStage({ claimId: file.claim.id, stage: "ENHANCEMENT" })}
        className="gap-1.5"
      >
        <span>{stagePending ? "Starting…" : "Start enhancement"}</span>
        <ArrowRight className="size-3.5" />
      </Button>
    );
  }

  if (status === "QUERY") {
    return (
      <Button size="sm" render={<a href="#queries" />} className="gap-1.5">
        <span>Reply to query</span>
        <ArrowRight className="size-3.5" />
      </Button>
    );
  }

  if (status === "DRAFT") {
    const isReady = file.insight.gaps.isReady;
    return (
      <Button
        size="sm"
        variant={isReady ? "default" : "outline"}
        className="gap-1.5"
        render={<a href="#submission" />}
      >
        {isReady && <CheckCircle2 className="text-success size-3.5" />}
        <span>Prepare submission</span>
      </Button>
    );
  }

  return null;
}
