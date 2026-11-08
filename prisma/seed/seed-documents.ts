import type { PrismaClient } from "../../src/generated/prisma/client";
import { storage } from "../../src/lib/storage";
import { newStorageKey } from "../../src/lib/storage/storage-key";
import { renderSamplePdf } from "./render-sample-pdf";
import { SEED_DOCUMENT_SPECS } from "./data/documents";
import { seedPreauthFields } from "./seed-preauth";

export async function seedDocuments(
  db: PrismaClient,
  maps: {
    userMap: Map<string, string>;
    docTypeMap: Map<string, string>;
  },
) {
  const { userMap, docTypeMap } = maps;
  const now = new Date();
  const arjunId = userMap.get("arjun.patil@claimtrail.example")!;

  try {
    await storage.removePrefix("claims/");
  } catch (err) {
    console.warn("Storage prefix cleanup skipped:", err);
  }

  const docsByFileName = new Map<string, { id: string; claimId: string; uploadedAt: Date }>();

  for (const spec of SEED_DOCUMENT_SPECS) {
    const claim = await db.claim.findFirst({
      where: { code: spec.claimCode },
    });
    if (!claim) continue;

    const uploadedAt = new Date(now.getTime() - spec.minutesAgo * 60_000);
    const dateStr = uploadedAt.toISOString().slice(0, 10);

    const bytes = await renderSamplePdf({
      title: spec.title,
      patientName: spec.patientNameOnDoc,
      date: dateStr,
      lines: spec.lines,
    });

    const storageKey = newStorageKey(claim.id, "pdf");
    await storage.put(storageKey, bytes, "application/pdf");

    const typeId = spec.typeKey ? docTypeMap.get(spec.typeKey) : null;

    const doc = await db.document.create({
      data: {
        claimId: claim.id,
        documentTypeId: typeId ?? null,
        status: spec.status ?? (typeId ? "SORTED" : "NEEDS_REVIEW"),
        sortedBy: spec.sortedBy ?? "AI",
        fileName: spec.fileName,
        mimeType: "application/pdf",
        sizeBytes: bytes.byteLength,
        pageCount: 1,
        storageKey,
        uploadedById: claim.assigneeId ?? arjunId,
        uploadedAt,
        aiDocumentTypeKey: spec.typeKey ?? spec.alternatives?.[0]?.documentType ?? "UNKNOWN",
        aiConfidence: spec.confidence ?? 0.95,
        aiReason: spec.reason ?? "Identified by document header and clinical content",
        aiAlternatives: spec.alternatives ?? undefined,
        aiFailed: spec.failed ?? false,
        patientNameOnDoc: spec.patientNameOnDoc,
        identityCheck: spec.identityCheck ?? "MATCH",
        documentDate: uploadedAt,
      },
    });

    docsByFileName.set(spec.fileName, {
      id: doc.id,
      claimId: claim.id,
      uploadedAt,
    });
  }

  await seedPreauthFields(db, { arjunId, docsByFileName });

  console.log(`✓ Seeded sample PDFs and documents for claims.`);
}
