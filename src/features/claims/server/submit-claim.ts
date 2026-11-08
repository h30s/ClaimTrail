import "server-only";
import type { SessionUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { recordAudit } from "@/features/audit/server/record-audit";
import { SubmitClaimSchema, type SubmitClaimInput } from "../schemas";
import { transitionClaim } from "./transition-claim";
import { getSubmissionCheck } from "./submission-check";
import { claimScopeWhere } from "./claim-scope";

export async function submitClaim(user: SessionUser, input: SubmitClaimInput) {
  const parsed = SubmitClaimSchema.parse(input);
  const check = await getSubmissionCheck(user, parsed.claimCode);

  if (check.status !== "DRAFT") {
    throw new ConflictError("This claim was already sent or is not in draft status.");
  }

  const blocking = check.blockingItems;
  const hasGaps = blocking.length > 0;

  if (hasGaps) {
    if (!can(user.role, "submission:override")) {
      throw new ConflictError(
        `${blocking.length} required item(s) still missing: ${blocking.join("; ")}. Ask the desk head to approve sending with gaps.`,
      );
    }
    const reason = parsed.overrideReason?.trim() ?? "";
    if (reason.length < 10 || reason.length > 300) {
      throw new ValidationError("Give a reason for sending with gaps (10 to 300 characters).", {
        overrideReason: ["Give a reason for sending with gaps (10 to 300 characters)."],
      });
    }
  }

  const reason = hasGaps ? parsed.overrideReason?.trim() : undefined;

  return await db.$transaction(async (tx) => {
    const claim = await tx.claim.findFirst({
      where: { code: parsed.claimCode, ...claimScopeWhere(user) },
      select: { id: true, stage: true, status: true },
    });
    if (!claim) throw new NotFoundError("Claim not found");

    const nextState = await transitionClaim(tx, claim, "SUBMIT", {
      actorId: user.id,
      note: reason,
      data: hasGaps ? { overriddenGaps: blocking } : undefined,
    });

    await tx.submission.create({
      data: {
        claimId: claim.id,
        stage: claim.stage,
        sentById: user.id,
        documentIds: check.packet.documentIds,
        checklistSnapshot: check.gaps.slots.map((s) => ({
          documentTypeId: s.item.documentTypeId,
          requirement: s.item.requirement,
          state: s.state,
        })),
        overriddenGaps: hasGaps ? blocking : undefined,
        overrideReason: reason ?? null,
      },
    });

    await recordAudit(tx, {
      actorId: user.id,
      action: "CLAIM_SUBMITTED",
      entityType: "Claim",
      entityId: claim.id,
      claimId: claim.id,
      data: {
        stage: claim.stage,
        override: hasGaps,
        reason: reason ?? null,
        blockingCount: blocking.length,
      },
    });

    return nextState;
  });
}
