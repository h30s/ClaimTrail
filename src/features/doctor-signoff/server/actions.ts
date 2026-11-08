"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { defineAction } from "@/lib/action";
import { createDoctorSignoffLink } from "./create-link";
import { decideDoctorSignoff } from "./decide";

const CreateLinkSchema = z.object({
  claimCode: z.string().min(1),
});

const DecideSchema = z.object({
  token: z.string().min(1),
  decision: z.enum(["APPROVE", "CHANGES_REQUESTED"]),
  comment: z.string().trim().max(500).optional(),
});

export const createDoctorSignoff = defineAction(
  { schema: CreateLinkSchema, permission: "claim:work" },
  async (input, { user }) => {
    const res = await createDoctorSignoffLink(user, input.claimCode);
    revalidatePath(`/claims/${input.claimCode}`);
    revalidatePath(`/claims/${input.claimCode}/preauth`);
    return res;
  },
);

export const submitDoctorDecision = defineAction({ schema: DecideSchema }, async (input) => {
  const res = await decideDoctorSignoff(input);
  revalidatePath(`/d/${input.token}`);
  return res;
});
