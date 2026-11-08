import "server-only";
import { can } from "@/lib/auth/permissions";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { recordAudit } from "@/features/audit/server/record-audit";
import type { AssignClaimInput } from "../schemas";

export async function assignClaim(user: SessionUser, input: AssignClaimInput): Promise<void> {
  if (!can(user.role, "claim:assign")) {
    throw new ForbiddenError("Only desk head can assign claims");
  }

  await db.$transaction(async (tx) => {
    const claim = await tx.claim.findUnique({
      where: { id: input.claimId },
      select: { id: true, stage: true, status: true },
    });
    if (!claim) throw new NotFoundError("Claim not found");

    const now = new Date();

    await tx.claim.update({
      where: { id: claim.id },
      data: { assigneeId: input.assigneeId },
    });

    await tx.claimEvent.create({
      data: {
        claimId: claim.id,
        type: "ASSIGNED",
        stage: claim.stage,
        status: claim.status,
        at: now,
        actorId: user.id,
        data: { assigneeId: input.assigneeId },
      },
    });

    await recordAudit(tx, {
      actorId: user.id,
      action: "CLAIM_ASSIGNED",
      entityType: "claim",
      entityId: claim.id,
      claimId: claim.id,
      data: { assigneeId: input.assigneeId },
    });
  });
}
