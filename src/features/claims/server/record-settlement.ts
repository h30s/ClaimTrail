import "server-only";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { recordAudit } from "@/features/audit/server/record-audit";
import { RecordSettlementSchema, type RecordSettlementInput } from "../schemas";
import { assertClaimAccess } from "./claim-scope";
import { transitionClaim } from "./transition-claim";

export async function recordSettlement(
  user: SessionUser,
  rawInput: RecordSettlementInput,
): Promise<{ id: string; code: string }> {
  const input = RecordSettlementSchema.parse(rawInput);

  const claim = await db.claim.findUnique({
    where: { code: input.claimCode },
    select: { id: true, code: true, stage: true, status: true },
  });

  if (!claim) {
    throw new NotFoundError("Claim not found");
  }

  await assertClaimAccess(user, claim.id);

  if (claim.stage !== "DISCHARGE" || claim.status !== "APPROVED") {
    throw new ConflictError(
      `Settlement can only be recorded on approved discharge claims (current: ${claim.stage} · ${claim.status})`,
    );
  }

  await db.$transaction(async (tx) => {
    await transitionClaim(tx, claim, "SETTLE", {
      actorId: user.id,
      note: `Settled ₹${input.settledAmount.toLocaleString("en-IN")} of ₹${input.billedAmount.toLocaleString("en-IN")}`,
    });

    await tx.claim.update({
      where: { id: claim.id },
      data: {
        billedAmount: input.billedAmount,
        settledAmount: input.settledAmount,
      },
    });

    if (input.deductions.length > 0) {
      await tx.deduction.createMany({
        data: input.deductions.map((d) => ({
          claimId: claim.id,
          reason: d.reason,
          amount: d.amount,
          note: d.note ? d.note.trim() : null,
        })),
      });
    }

    await recordAudit(tx, {
      actorId: user.id,
      action: "CLAIM_SETTLED",
      entityType: "claim",
      entityId: claim.id,
      claimId: claim.id,
      data: {
        billedAmount: input.billedAmount,
        settledAmount: input.settledAmount,
        deductionsCount: input.deductions.length,
        deductions: input.deductions,
      },
    });
  });

  return { id: claim.id, code: claim.code };
}
