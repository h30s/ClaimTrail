"use server";

import { revalidatePath } from "next/cache";
import { defineAction } from "@/lib/action";
import { ConfirmPreauthFieldSchema } from "../schemas";
import { confirmField as confirmFieldOp } from "./confirm-field";

export const confirmPreauthField = defineAction(
  { schema: ConfirmPreauthFieldSchema, permission: "claim:work" },
  async (input, { user }) => {
    const res = await confirmFieldOp(user, input);
    revalidatePath(`/claims/${input.claimCode}/preauth`);
    revalidatePath(`/claims/${input.claimCode}`);
    return res;
  },
);
