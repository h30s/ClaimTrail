import { errorResponse, requireApiUser } from "@/lib/http";
import { storage } from "@/lib/storage";
import { db } from "@/lib/db";
import { recordAudit } from "@/features/audit/server/record-audit";
import { getDocumentForViewer } from "@/features/documents/server/queries";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const doc = await getDocumentForViewer(user, id);

    const bytes = await storage.get(doc.storageKey);

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
