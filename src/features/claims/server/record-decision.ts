import "server-only";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { recordAudit } from "@/features/audit/server/record-audit";
import type { RecordDecisionInput } from "../schemas";
import { assertClaimAccess } from "./claim-scope";
import { transitionClaim } from "./transition-claim";

export async function recordDecision(user: SessionUser, input: RecordDecisionInput): Promise<void> {
  await assertClaimAccess(user, input.claimId);

  await db.$transaction(async (tx) => {
    const claim = await tx.claim.findUnique({
      where: { id: input.claimId },
      select: { id: true, stage: true, status: true },
    });
    if (!claim) throw new NotFoundError("Claim not found");

    if (input.decision === "APPROVE") {
      await transitionClaim(tx, claim, "APPROVE", {
        actorId: user.id,
        note: `Approved ₹${input.approvedAmount}`,
      });

      await tx.claim.update({
        where: { id: claim.id },
        data: { approvedAmount: input.approvedAmount },
      });

      await recordAudit(tx, {
        actorId: user.id,
        action: "CLAIM_TRANSITIONED",
        entityType: "claim",
        entityId: claim.id,
        claimId: claim.id,
        data: { decision: "APPROVE", approvedAmount: input.approvedAmount },
      });
    } else {
      await transitionClaim(tx, claim, "REJECT", {
        actorId: user.id,
        note: input.reason,
      });

      await recordAudit(tx, {
        actorId: user.id,
        action: "CLAIM_TRANSITIONED",
        entityType: "claim",
        entityId: claim.id,
        claimId: claim.id,
        data: { decision: "REJECT", reason: input.reason },
      });
    }
  });
}
