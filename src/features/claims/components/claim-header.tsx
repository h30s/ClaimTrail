import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { can } from "@/lib/auth/permissions";
import type { SessionUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import type { ClaimFileDto } from "../types";
import { ClaimMoreMenu } from "./claim-more-menu";
import { ClaimStepper } from "./claim-stepper";
import { ClockPair } from "./clock-pair";
import { PrimaryAction } from "./primary-action";

export type ExecutiveOption = {
  id: string;
  name: string;
};

export function ClaimHeader({
  file,
  user,
  executives,
}: {
  file: ClaimFileDto;
  user: SessionUser;
  executives: ExecutiveOption[];
}) {
  const isHead = can(user.role, "claim:assign");
  const age = Math.max(0, file.claim.admittedAt.getFullYear() - file.patient.dateOfBirth.getFullYear());

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/claims"
          className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Claims</span>
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-foreground flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight">
              <span className="font-mono">{file.claim.code}</span>
              <span className="text-muted-foreground font-light">·</span>
              <span>{file.patient.name}</span>
              <span className="text-muted-foreground font-mono text-xs font-normal">
                {age} {file.patient.gender} · UHID {file.patient.uhid}
              </span>
            </h1>

            <p className="text-muted-foreground mt-1 text-xs">
              <span>
                {file.payer.name} ({file.payer.kind})
              </span>
              <span className="text-muted-foreground/50 mx-1.5">·</span>
              <span>{file.procedure.name}</span>
              <span className="text-muted-foreground/50 mx-1.5">·</span>
              <span>{file.claim.treatingDoctor}</span>
              <span className="text-muted-foreground/50 mx-1.5">·</span>
              <span>Admitted {formatDateTime(file.claim.admittedAt)}</span>
              <span className="text-muted-foreground/50 mx-1.5">·</span>
              <span>
                Assigned to{" "}
                <strong className="text-foreground font-medium">{file.assignee?.name ?? "Unassigned"}</strong>
              </span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <PrimaryAction file={file} user={user} />
            <ClaimMoreMenu file={file} isHead={isHead} executives={executives} />
          </div>
        </div>
      </div>

      <div className="border-border flex flex-col gap-4 border-y py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <ClaimStepper milestones={file.insight.milestones} className="flex-1" />
        <ClockPair report={file.insight.clocks} className="shrink-0 pt-1 sm:pt-0" />
      </div>
    </div>
  );
}
