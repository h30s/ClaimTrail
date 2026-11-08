"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import { can } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth/session";
import type { ClaimFileDto } from "../types";
import { startStage } from "../server/actions";
import { PrepareSubmissionDialog } from "./prepare-submission-dialog";
import { RecordDecisionDialog } from "./record-decision-dialog";

export function PrimaryAction({ file, user }: { file: ClaimFileDto; user: SessionUser }) {
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [prepareOpen, setPrepareOpen] = useState(false);
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
    const targetQuery = file.openQueries?.[0];
    const href = targetQuery ? `/inbox/${targetQuery.id}` : "/inbox";
    return (
      <Link href={href} className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
        <span>Reply to query</span>
        <ArrowRight className="size-3.5" />
      </Link>
    );
  }

  if (status === "DRAFT") {
    const isReady = file.insight.gaps.isReady;
    return (
      <>
        <Button
          size="sm"
          variant={isReady ? "default" : "outline"}
          className="gap-1.5"
          onClick={() => setPrepareOpen(true)}
        >
          {isReady && <CheckCircle2 className="text-success size-3.5" />}
          <span>Prepare submission</span>
        </Button>
        <PrepareSubmissionDialog
          claimCode={file.claim.code}
          payerName={file.payer.name}
          stage={stage}
          open={prepareOpen}
          onOpenChange={setPrepareOpen}
          isHead={can(user.role, "submission:override")}
        />
      </>
    );
  }

  return null;
}
