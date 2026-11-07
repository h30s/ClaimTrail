import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { recordAudit } from "@/features/audit/server/record-audit";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ConflictError } from "@/lib/errors";
import type { SetRuleInput } from "../schemas";

export async function setRule(user: SessionUser, input: SetRuleInput) {
  try {
    await db.$transaction(async (tx) => {
      const existing = await tx.checklistRule.findFirst({
        where: {
          payerId: input.payerId,
          procedureId: input.procedureId,
          stage: input.stage,
          documentTypeId: input.documentTypeId,
        },
      });

      if (input.requirement === "INHERIT") {
        if (existing) {
          await tx.checklistRule.delete({ where: { id: existing.id } });
          await recordAudit(tx, {
            actorId: user.id,
            action: "RULE_REMOVED",
            entityType: "ChecklistRule",
            entityId: existing.id,
            data: { before: existing },
          });
        }
      } else if (existing) {
        const updated = await tx.checklistRule.update({
          where: { id: existing.id },
          data: {
            requirement: input.requirement,
            needsFreshCopy: input.needsFreshCopy,
            updatedById: user.id,
          },
        });
        await recordAudit(tx, {
          actorId: user.id,
          action: "RULE_UPDATED",
          entityType: "ChecklistRule",
          entityId: existing.id,
          data: { before: existing, after: updated },
        });
      } else {
        const created = await tx.checklistRule.create({
          data: {
            payerId: input.payerId,
            procedureId: input.procedureId,
            stage: input.stage,
            documentTypeId: input.documentTypeId,
            requirement: input.requirement,
            needsFreshCopy: input.needsFreshCopy,
            updatedById: user.id,
          },
        });
        await recordAudit(tx, {
          actorId: user.id,
          action: "RULE_UPDATED",
          entityType: "ChecklistRule",
          entityId: created.id,
          data: { before: null, after: created },
        });
      }
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError("Someone just changed this rule. Reload and try again.");
    }
    throw err;
  }

  const affectedOpenClaims = await db.claim.count({
    where: {
      status: { notIn: ["SETTLED", "REJECTED"] },
      ...(input.payerId && { payerId: input.payerId }),
      ...(input.procedureId && { procedureId: input.procedureId }),
    },
  });

  return { affectedOpenClaims };
}
