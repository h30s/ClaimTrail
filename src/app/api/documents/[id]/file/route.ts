import { errorResponse, requireApiUser } from "@/lib/http";
import { storage } from "@/lib/storage";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { recordAudit } from "@/features/audit/server/record-audit";
import { getDocumentForViewer } from "@/features/documents/server/queries";
import { renderDocumentPdf } from "@/features/documents/server/render-document-pdf";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const doc = await getDocumentForViewer(user, id);

    let bytes: Uint8Array;
    try {
      bytes = await storage.get(doc.storageKey);
    } catch {
      if (doc.mimeType === "application/pdf") {
        bytes = await renderDocumentPdf({
          fileName: doc.fileName,
          claimCode: doc.claim.code,
          patientName: doc.claim.patient.name,
          documentTypeLabel: doc.documentType?.label,
          uploadedAt: doc.uploadedAt,
        });
        try {
          await storage.put(doc.storageKey, bytes, "application/pdf");
        } catch {
          // Non-blocking if storage write fails
        }
      } else {
        throw new NotFoundError(`File not found: ${doc.storageKey}`);
      }
    }

    await recordAudit(db, {
      actorId: user.id,
      action: "DOCUMENT_VIEWED",
      entityType: "DOCUMENT",
      entityId: doc.id,
      claimId: doc.claimId,
      data: { fileName: doc.fileName },
    });

    const safeName = doc.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `inline; filename="${safeName}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
