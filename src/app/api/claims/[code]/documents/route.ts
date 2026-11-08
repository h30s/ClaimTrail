import { can } from "@/lib/auth/permissions";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import { assertSameOrigin, errorResponse, requireApiUser } from "@/lib/http";
import { ClaimCodeSchema } from "@/features/claims/schemas";
import { uploadDocument } from "@/features/documents/server/upload-document";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const user = await requireApiUser();
    assertSameOrigin(request);
    if (!can(user.role, "claim:work")) throw new ForbiddenError();

    const { code } = await params;
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ValidationError("Choose a file to upload.");

    const document = await uploadDocument(user, ClaimCodeSchema.parse(code), {
      name: file.name,
      bytes: new Uint8Array(await file.arrayBuffer()),
    });

    return Response.json({ document });
  } catch (error) {
    return errorResponse(error);
  }
}
