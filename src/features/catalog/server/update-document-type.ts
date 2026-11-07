import "server-only";
import { recordAudit } from "@/features/audit/server/record-audit";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import type { UpdateDocumentTypeInput } from "../schemas";

export async function updateDocumentType(user: SessionUser, input: UpdateDocumentTypeInput) {
  return db.$transaction(async (tx) => {
    const existing = await tx.documentType.findUnique({
      where: { id: input.id },
    });
    if (!existing) throw new NotFoundError("Document type not found.");

    const updated = await tx.documentType.update({
      where: { id: input.id },
      data: {
        label: input.label,
        description: input.description,
        sortOrder: input.sortOrder,
        active: input.active,
      },
    });

    await recordAudit(tx, {
      actorId: user.id,
      action: "DOCUMENT_TYPE_UPDATED",
      entityType: "DocumentType",
      entityId: input.id,
      data: { before: existing, after: updated },
    });

    return updated;
  });
}
