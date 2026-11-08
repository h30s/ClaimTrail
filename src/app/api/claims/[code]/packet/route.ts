import { type NextRequest } from "next/server";
import { z } from "zod";
import { errorResponse, requireApiUser } from "@/lib/http";
import { db } from "@/lib/db";
import { recordAudit } from "@/features/audit/server/record-audit";
import { getPacketContents } from "@/features/packets/server/packet-contents";
import { buildPacket } from "@/features/packets/server/build-packet";
import type { Stage } from "@/lib/enums";

export const runtime = "nodejs";

const StageQuerySchema = z.enum(["PRE_AUTH", "ENHANCEMENT", "DISCHARGE"]).optional();

const STAGE_NAME_MAP: Record<Stage, string> = {
  PRE_AUTH: "PreAuth",
  ENHANCEMENT: "Enhancement",
  DISCHARGE: "Discharge",
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const user = await requireApiUser();
    const { code } = await params;

    const { searchParams } = new URL(request.url);
    const stageParam = searchParams.get("stage") ?? undefined;
    const stageParsed = StageQuerySchema.safeParse(stageParam);
    const stage = stageParsed.success ? stageParsed.data : undefined;

    const contents = await getPacketContents(user, code, stage);
    const bytes = await buildPacket(contents);

    await recordAudit(db, {
      actorId: user.id,
      action: "PACKET_DOWNLOADED",
      entityType: "Claim",
      entityId: contents.claim.id,
      claimId: contents.claim.id,
      data: {
        stage: contents.stage,
        documentCount: contents.documents.length,
      },
    });

    const safePayer = contents.payer.name.replace(/[^a-zA-Z0-9_-]/g, "-");
    const stageName = STAGE_NAME_MAP[contents.stage] ?? "Packet";
    const filename = `${code}_${stageName}_${safePayer}.pdf`;

    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
