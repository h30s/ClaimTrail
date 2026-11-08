import "server-only";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { assertClaimAccess } from "@/features/claims/server/claim-scope";
import { recordAudit } from "@/features/audit/server/record-audit";

export async function removeDocument(
  user: SessionUser,
  documentId: string,
): Promise<{ id: string; claimId: string }> {
  const doc = await db.document.findUnique({
    where: { id: documentId, deletedAt: null },
    select: { id: true, claimId: true, fileName: true },
  });

  if (!doc) {
    throw new NotFoundError("Document not found.");
  }

  await assertClaimAccess(user, doc.claimId);

  await db.$transaction(async (tx) => {
    await tx.document.update({
      where: { id: doc.id },
      data: { deletedAt: new Date() },
    });

    await recordAudit(tx, {
      actorId: user.id,
      action: "DOCUMENT_REMOVED",
      entityType: "DOCUMENT",
      entityId: doc.id,
      claimId: doc.claimId,
      data: { fileName: doc.fileName },
    });
  });

  return { id: doc.id, claimId: doc.claimId };
}
