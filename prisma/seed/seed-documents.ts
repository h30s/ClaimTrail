import type { PrismaClient } from "../../src/generated/prisma/client";
import { storage } from "../../src/lib/storage";
import { newStorageKey } from "../../src/lib/storage/storage-key";
import { PREAUTH_FIELDS } from "../../src/features/preauth/domain/preauth-fields";
import { renderSamplePdf } from "./render-sample-pdf";
import { SEED_DOCUMENT_SPECS } from "./data/documents";

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

    // If CLM-3381: confirm all 12 fields (as per brief: "All 12 fields confirmed")
    if (claim.code === "CLM-3381" && spec.typeKey === "PREAUTH_FORM") {
      const fieldValues: Record<string, string> = {
        patientName: "Rajendra Pawar",
        age: "54",
        gender: "MALE",
        policyNumber: claim.policyNumber,
        memberId: "MED-2024-88491",
        admissionDate: dateStr,
        treatingDoctor: claim.treatingDoctor,
        chiefComplaints: "Severe right upper quadrant pain radiating to back x 3 days",
        provisionalDiagnosis: "Cholelithiasis with acute cholecystitis",
        proposedTreatment: "Laparoscopic Cholecystectomy",
        expectedStayDays: "2",
        estimatedCost: "85000",
      };

      for (const f of PREAUTH_FIELDS) {
        const val = fieldValues[f.key] ?? "N/A";
        await db.fieldSuggestion.create({
          data: {
            claimId: claim.id,
            documentId: doc.id,
            fieldKey: f.key,
            value: val,
            sourceSnippet: `${f.label}: ${val}`,
            confidence: 0.96,
          },
        });

        await db.claimField.create({
          data: {
            claimId: claim.id,
            fieldKey: f.key,
            value: val,
            confirmedById: arjunId,
            confirmedAt: uploadedAt,
          },
        });
      }
    }
  }

  console.log(`✓ Seeded sample PDFs and documents for claims.`);
}
