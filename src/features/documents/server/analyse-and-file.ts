import "server-only";
import { PDFDocument } from "pdf-lib";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { storage } from "@/lib/storage";
import { recordAudit } from "@/features/audit/server/record-audit";
import { getAiProvider } from "@/features/ai/get-provider";
import { recordAiRun } from "@/features/ai/server/record-ai-run";
import type { DocumentTypeHint } from "@/features/ai/provider";
import { decideSort } from "../domain/sort-decision";
import { compareNames } from "../domain/name-match";
import { toDocumentDto, type DocumentWithRelations } from "./to-dto";
import type { DocumentDto } from "../types";

export async function analyseAndFile(documentId: string, actorId?: string | null): Promise<DocumentDto> {
  const doc = await db.document.findUnique({
    where: { id: documentId },
    include: {
      claim: { include: { patient: true } },
    },
  });

  if (!doc) throw new NotFoundError("Document not found.");

  const docTypes = await db.documentType.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  const bytes = await storage.get(doc.storageKey);

  let pageCount = 1;
  if (doc.mimeType === "application/pdf") {
    try {
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      pageCount = pdf.getPageCount();
    } catch {
      pageCount = 1;
    }
  }

  const provider = await getAiProvider();
  const typeHints: DocumentTypeHint[] = docTypes.map((t) => ({
    key: t.key,
    label: t.label,
    description: t.description,
  }));

  const result = await provider.analyseDocument({
    bytes,
    mimeType: doc.mimeType,
    fileName: doc.fileName,
    documentTypes: typeHints,
  });

  const activeKeys = new Set(docTypes.map((t) => t.key));
  const analysis = result.ok ? result.data : null;
  const decision = decideSort(
    analysis
      ? {
          documentType: analysis.documentType,
          confidence: analysis.confidence,
          isLegible: analysis.isLegible,
        }
      : null,
    activeKeys,
  );

  const identity = compareNames(doc.claim.patient.name, analysis?.patientName ?? null);

  let targetDocumentTypeId: string | null = null;
  if (decision.kind === "FILE") {
    const matched = docTypes.find((t) => t.key === decision.documentTypeKey);
    targetDocumentTypeId = matched?.id ?? null;
  }

  let parsedDate: Date | null = null;
  if (analysis?.documentDate && /^\d{4}-\d{2}-\d{2}$/.test(analysis.documentDate)) {
    const d = new Date(analysis.documentDate);
    if (!Number.isNaN(d.getTime())) parsedDate = d;
  }

  const updated = await db.$transaction(async (tx) => {
    await recordAiRun(tx, {
      task: "ANALYSE_DOCUMENT",
      result,
      documentId: doc.id,
    });

    const docRow = await tx.document.update({
      where: { id: doc.id },
      data: {
        status: decision.kind === "FILE" ? "SORTED" : "NEEDS_REVIEW",
        documentTypeId: targetDocumentTypeId,
        sortedBy: "AI",
        pageCount,
        aiDocumentTypeKey: analysis?.documentType ?? null,
        aiConfidence: analysis?.confidence ?? null,
        aiReason: analysis?.reason ?? null,
        aiAlternatives: analysis?.alternatives ?? undefined,
        aiFailed: !result.ok,
        patientNameOnDoc: analysis?.patientName ?? null,
        identityCheck: identity === "MISMATCH" ? "MISMATCH" : identity === "MATCH" ? "MATCH" : "UNCHECKED",
        documentDate: parsedDate,
      },
      include: {
        documentType: { select: { id: true, key: true, label: true } },
        uploadedBy: { select: { id: true, name: true } },
      },
    });

    if (analysis?.fields && analysis.fields.length > 0) {
      const suggestions = analysis.fields
        .filter((f) => f.sourceSnippet.trim().length > 0 && f.value.trim().length > 0)
        .map((f) => ({
          claimId: doc.claimId,
          documentId: doc.id,
          fieldKey: f.key,
          value: f.value.trim(),
          sourceSnippet: f.sourceSnippet.trim(),
          confidence: f.confidence,
        }));

      if (suggestions.length > 0) {
        await tx.fieldSuggestion.createMany({ data: suggestions });
      }
    }

    await recordAudit(tx, {
      actorId: actorId ?? null,
      action: "DOCUMENT_ANALYSED",
      entityType: "DOCUMENT",
      entityId: doc.id,
      claimId: doc.claimId,
      data: {
        decisionKind: decision.kind,
        targetKey: decision.kind === "FILE" ? decision.documentTypeKey : undefined,
        confidence: analysis?.confidence ?? 0,
        identity,
      },
    });

    return docRow;
  });

  return toDocumentDto(updated as DocumentWithRelations);
}
