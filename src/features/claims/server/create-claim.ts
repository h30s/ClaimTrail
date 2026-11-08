import "server-only";
import type { Gender } from "@/lib/enums";
import { can } from "@/lib/auth/permissions";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { recordAudit } from "@/features/audit/server/record-audit";
import type { CreateClaimInput } from "../schemas";

export async function createClaim(
  user: SessionUser,
  input: CreateClaimInput,
): Promise<{ id: string; code: string }> {
  const isHead = can(user.role, "claim:assign");
  const assigneeId = isHead ? (input.assigneeId ?? null) : user.id;

  return db.$transaction(async (tx) => {
    let patientId = input.patientId;

    if (!patientId) {
      const patient = await tx.patient.upsert({
        where: { uhid: input.patientUhid! },
        update: {
          name: input.patientName!,
          gender: input.patientGender as Gender,
          dateOfBirth: new Date(input.patientDob!),
        },
        create: {
          uhid: input.patientUhid!,
          name: input.patientName!,
          gender: input.patientGender as Gender,
          dateOfBirth: new Date(input.patientDob!),
        },
      });
      patientId = patient.id;
    }

    // Get max code
    const lastClaim = await tx.claim.findFirst({
      orderBy: { code: "desc" },
      select: { code: true },
    });

    let nextNumber = 3381;
    if (lastClaim?.code) {
      const match = /CLM-(\d+)/.exec(lastClaim.code);
      if (match && match[1]) {
        nextNumber = Math.max(nextNumber, parseInt(match[1], 10) + 1);
      }
    }
    const code = `CLM-${nextNumber}`;
    const now = new Date();

    const claim = await tx.claim.create({
      data: {
        code,
        patientId,
        payerId: input.payerId,
        procedureId: input.procedureId,
        policyNumber: input.policyNumber,
        payerReference: input.payerReference ?? null,
        treatingDoctor: input.treatingDoctor,
        admittedAt: new Date(input.admittedAt),
        estimatedAmount: input.estimatedAmount,
        stage: "PRE_AUTH",
        status: "DRAFT",
        stageStartedAt: now,
        statusChangedAt: now,
        assigneeId,
      },
    });

    await tx.claimEvent.create({
      data: {
        claimId: claim.id,
        type: "CREATED",
        stage: "PRE_AUTH",
        status: "DRAFT",
        at: now,
        actorId: user.id,
      },
    });

    await recordAudit(tx, {
      actorId: user.id,
      action: "CLAIM_CREATED",
      entityType: "claim",
      entityId: claim.id,
      claimId: claim.id,
      data: { code, patientId, payerId: input.payerId },
    });

    return { id: claim.id, code: claim.code };
  });
}
