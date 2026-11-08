"use client";

import { useState } from "react";
import { MoreHorizontal, UserCheck, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAction } from "@/hooks/use-action";
import type { ClaimFileDto } from "../types";
import { startStage } from "../server/actions";
import { AssignClaimDialog, type ExecutiveOption } from "./assign-claim-dialog";
import { RecordDecisionDialog } from "./record-decision-dialog";

export function ClaimMoreMenu({
  file,
  isHead,
  executives,
}: {
  file: ClaimFileDto;
  isHead: boolean;
  executives: ExecutiveOption[];
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const { run: runStartStage, pending: stagePending } = useAction(startStage, {
    success: "Discharge stage started",
  });

  const { status, stage } = file.claim;
  const canReject = status === "SENT";
  const canStartDischarge = status === "APPROVED" && stage !== "DISCHARGE";

  if (!canReject && !canStartDischarge && !isHead) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="icon-sm">
              <MoreHorizontal className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          {canStartDischarge && (
            <DropdownMenuItem
              disabled={stagePending}
              onClick={() => runStartStage({ claimId: file.claim.id, stage: "DISCHARGE" })}
            >
              <ArrowRight className="mr-2 size-3.5" />
              <span>Start discharge</span>
            </DropdownMenuItem>
          )}

          {canReject && (
            <DropdownMenuItem onClick={() => setRejectOpen(true)} className="text-danger focus:text-danger">
              <XCircle className="mr-2 size-3.5" />
              <span>Reject cashless</span>
            </DropdownMenuItem>
          )}

          {isHead && (
            <DropdownMenuItem onClick={() => setAssignOpen(true)}>
              <UserCheck className="mr-2 size-3.5" />
              <span>Assign claim…</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canReject && (
        <RecordDecisionDialog
          claimId={file.claim.id}
          estimatedAmount={file.claim.estimatedAmount}
          open={rejectOpen}
          onOpenChange={setRejectOpen}
          initialDecision="REJECT"
        />
      )}

      {isHead && (
        <AssignClaimDialog
          claimId={file.claim.id}
          currentAssigneeId={file.assignee?.id ?? null}
          executives={executives}
          open={assignOpen}
          onOpenChange={setAssignOpen}
        />
      )}
    </>
  );
}
