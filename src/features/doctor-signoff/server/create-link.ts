import "server-only";
import crypto from "node:crypto";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { recordAudit } from "@/features/audit/server/record-audit";
import { assertClaimAccess } from "@/features/claims/server/claim-scope";
import { hashDoctorToken } from "./hash";

export async function createDoctorSignoffLink(
  user: SessionUser,
  claimCode: string,
): Promise<{ token: string; path: string; expiresAt: Date; doctorName: string }> {
  const claim = await db.claim.findUnique({
    where: { code: claimCode },
    select: {
      id: true,
      code: true,
      stage: true,
      status: true,
      treatingDoctor: true,
    },
  });

  if (!claim) {
    throw new NotFoundError("Claim not found");
  }

  await assertClaimAccess(user, claim.id);

  if (claim.stage !== "PRE_AUTH" || claim.status !== "DRAFT") {
    throw new ConflictError("Doctor sign-off links can only be generated for pre-auth drafts.");
  }

  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashDoctorToken(token);
  const expiresAt = new Date(Date.now() + 24 * 3600 * 1000);

  await db.$transaction(async (tx) => {
    // Delete any older pending approval for this claim
    await tx.doctorApproval.deleteMany({
      where: { claimId: claim.id, status: "PENDING" },
    });

    await tx.doctorApproval.create({
      data: {
        claimId: claim.id,
        doctorName: claim.treatingDoctor,
        tokenHash,
        expiresAt,
        status: "PENDING",
        createdById: user.id,
      },
    });

    await recordAudit(tx, {
      actorId: user.id,
      action: "DOCTOR_LINK_CREATED",
      entityType: "claim",
      entityId: claim.id,
      claimId: claim.id,
      data: {
        doctorName: claim.treatingDoctor,
        expiresAt,
      },
    });
  });

  return {
    token,
    path: `/d/${token}`,
    expiresAt,
    doctorName: claim.treatingDoctor,
  };
}
