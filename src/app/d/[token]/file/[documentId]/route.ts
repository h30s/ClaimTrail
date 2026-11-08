import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage";
import { hashDoctorToken } from "@/features/doctor-signoff/server/hash";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  props: { params: Promise<{ token: string; documentId: string }> },
) {
  try {
    const { token, documentId } = await props.params;
    const tokenHash = hashDoctorToken(token);

    const approval = await db.doctorApproval.findUnique({
      where: { tokenHash },
      select: { claimId: true, expiresAt: true },
    });

    if (!approval || approval.expiresAt < new Date()) {
      return new NextResponse("Invalid or expired token", { status: 403 });
    }

    const doc = await db.document.findFirst({
      where: {
        id: documentId,
        claimId: approval.claimId,
        deletedAt: null,
      },
    });

    if (!doc) {
      return new NextResponse("Document not found", { status: 404 });
    }

    const bytes = await storage.get(doc.storageKey);
    const safeName = doc.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `inline; filename="${safeName}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new NextResponse("Unable to load document", { status: 500 });
  }
}
