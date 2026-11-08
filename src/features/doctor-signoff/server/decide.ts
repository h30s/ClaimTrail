import "server-only";
import { db } from "@/lib/db";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { recordAudit } from "@/features/audit/server/record-audit";
import { hashDoctorToken } from "./hash";

export type DoctorDecisionInput = {
  token: string;
  decision: "APPROVE" | "CHANGES_REQUESTED";
  comment?: string;
};

export async function decideDoctorSignoff(input: DoctorDecisionInput): Promise<{
  id: string;
  status: "APPROVED" | "CHANGES_REQUESTED";
}> {
  const tokenHash = hashDoctorToken(input.token);

  const approval = await db.doctorApproval.findUnique({
    where: { tokenHash },
    include: {
      claim: { select: { id: true, code: true } },
    },
  });

  if (!approval) {
    throw new NotFoundError("Sign-off link is invalid or has expired.");
  }

  if (approval.status !== "PENDING") {
    throw new ConflictError("A decision has already been recorded on this sign-off link.");
  }

  if (approval.expiresAt < new Date()) {
    throw new ConflictError("This doctor sign-off link has expired. Please request a new link.");
  }

  const newStatus = input.decision === "APPROVE" ? "APPROVED" : "CHANGES_REQUESTED";
  const comment = input.comment?.trim() || null;

  await db.$transaction(async (tx) => {
    await tx.doctorApproval.update({
      where: { id: approval.id },
      data: {
        status: newStatus,
        comment,
        decidedAt: new Date(),
      },
    });

    await recordAudit(tx, {
      actorId: null,
      action: "DOCTOR_DECIDED",
      entityType: "claim",
      entityId: approval.claim.id,
      claimId: approval.claim.id,
      data: {
        doctorName: approval.doctorName,
        decision: newStatus,
        comment,
      },
    });
  });

  return { id: approval.id, status: newStatus };
}
