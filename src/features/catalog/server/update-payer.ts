import "server-only";
import { recordAudit } from "@/features/audit/server/record-audit";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import type { UpdatePayerInput } from "../schemas";

export async function updatePayer(user: SessionUser, input: UpdatePayerInput) {
  return db.$transaction(async (tx) => {
    const existing = await tx.payer.findUnique({
      where: { id: input.id },
    });
    if (!existing) throw new NotFoundError("Payer not found.");

    const updated = await tx.payer.update({
      where: { id: input.id },
      data: {
        queryReplyHours: input.queryReplyHours,
        emailDomain: input.emailDomain.toLowerCase(),
        active: input.active,
      },
    });

    await recordAudit(tx, {
      actorId: user.id,
      action: "PAYER_UPDATED",
      entityType: "Payer",
      entityId: input.id,
      data: { before: existing, after: updated },
    });

    return updated;
  });
}
