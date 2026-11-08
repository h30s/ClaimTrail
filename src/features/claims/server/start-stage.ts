import "server-only";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { recordAudit } from "@/features/audit/server/record-audit";
import type { StartStageInput } from "../schemas";
import { assertClaimAccess } from "./claim-scope";
import { transitionClaim } from "./transition-claim";

export async function startStage(user: SessionUser, input: StartStageInput): Promise<void> {
  await assertClaimAccess(user, input.claimId);

  await db.$transaction(async (tx) => {
    const claim = await tx.claim.findUnique({
      where: { id: input.claimId },
      select: { id: true, stage: true, status: true },
    });
    if (!claim) throw new NotFoundError("Claim not found");

    const event = input.stage === "ENHANCEMENT" ? "START_ENHANCEMENT" : "START_DISCHARGE";

    await transitionClaim(tx, claim, event, {
      actorId: user.id,
      note: `Started ${input.stage} stage`,
    });

    await recordAudit(tx, {
      actorId: user.id,
      action: "CLAIM_TRANSITIONED",
      entityType: "claim",
      entityId: claim.id,
      claimId: claim.id,
      data: { stage: input.stage },
    });
  });
}
