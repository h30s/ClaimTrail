"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { defineAction } from "@/lib/action";
import { db } from "@/lib/db";
import { claimScopeWhere } from "@/features/claims/server/claim-scope";
import { LinkQuerySchema, RecordReplySchema, SimulateEmailSchema } from "../schemas";
import { ingestQuery } from "./ingest-query";
import { linkQuery as linkQueryOp } from "./link-query";
import { recordReply as recordReplyOp } from "./record-reply";

export const simulateIncomingEmail = defineAction(
  { schema: SimulateEmailSchema, permission: "claim:work" },
  async (input, { user }) => {
    const receivedAt = input.receivedAt ? new Date(input.receivedAt) : new Date();
    const query = await ingestQuery(user.id, {
      fromAddress: input.fromAddress,
      subject: input.subject,
      body: input.body,
      receivedAt,
    });

    revalidatePath("/inbox");
    revalidatePath("/claims");
    return { id: query.id };
  },
);

export const linkQueryAction = defineAction(
  { schema: LinkQuerySchema, permission: "claim:work" },
  async (input, { user }) => {
    const query = await linkQueryOp(user, input);
    revalidatePath("/inbox");
    revalidatePath(`/inbox/${input.queryId}`);
    revalidatePath("/claims");
    return { success: true, claimId: query.claimId };
  },
);

export const recordReplyAction = defineAction(
  { schema: RecordReplySchema, permission: "claim:work" },
  async (input, { user }) => {
    const query = await recordReplyOp(user, input);
    revalidatePath("/inbox");
    revalidatePath(`/inbox/${input.queryId}`);
    revalidatePath("/claims");
    return { success: true, queryId: query.id };
  },
);

export const searchClaimsToLink = defineAction(
  { schema: z.object({ q: z.string().trim().min(1) }), permission: "claim:work" },
  async ({ q }, { user }) => {
    const claims = await db.claim.findMany({
      where: {
        ...claimScopeWhere(user),
        OR: [
          { code: { contains: q, mode: "insensitive" } },
          { patient: { name: { contains: q, mode: "insensitive" } } },
          { policyNumber: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        code: true,
        patient: { select: { name: true } },
        payer: { select: { name: true } },
      },
      take: 8,
    });

    return claims.map((c) => ({
      id: c.id,
      code: c.code,
      patientName: c.patient.name,
      payerName: c.payer.name,
    }));
  },
);
