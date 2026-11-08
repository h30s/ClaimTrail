import "server-only";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { storage } from "@/lib/storage";
import { newStorageKey } from "@/lib/storage/storage-key";
import { recordAudit } from "@/features/audit/server/record-audit";
import { claimScopeWhere } from "@/features/claims/server/claim-scope";
import { sniffUpload } from "./sniff-file";
import { analyseAndFile } from "./analyse-and-file";
import type { DocumentDto } from "../types";

export type UploadFileInput = {
  name: string;
  bytes: Uint8Array;
};

export async function uploadDocument(
  user: SessionUser,
  claimCode: string,
  file: UploadFileInput,
): Promise<DocumentDto> {
  const claim = await db.claim.findFirst({
    where: { code: claimCode, ...claimScopeWhere(user) },
    select: { id: true, code: true },
  });

  if (!claim) {
    throw new NotFoundError("Claim not found.");
  }

  const sniffed = await sniffUpload(file.bytes);
  const storageKey = newStorageKey(claim.id, sniffed.ext);

  await storage.put(storageKey, file.bytes, sniffed.mime);

  const doc = await db.$transaction(async (tx) => {
    const created = await tx.document.create({
      data: {
        claimId: claim.id,
        fileName: file.name,
        mimeType: sniffed.mime,
        sizeBytes: file.bytes.byteLength,
        storageKey,
        status: "PROCESSING",
        uploadedById: user.id,
      },
    });

    await recordAudit(tx, {
      actorId: user.id,
      action: "DOCUMENT_UPLOADED",
      entityType: "DOCUMENT",
      entityId: created.id,
      claimId: claim.id,
      data: {
        fileName: file.name,
        sizeBytes: file.bytes.byteLength,
        mimeType: sniffed.mime,
      },
    });

    return created;
  });

  return analyseAndFile(doc.id, user.id);
}
