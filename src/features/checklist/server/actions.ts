"use server";

import { revalidatePath } from "next/cache";
import { defineAction } from "@/lib/action";
import { SetRuleSchema } from "../schemas";
import { setRule as setRuleService } from "./set-rule";

export const setChecklistRule = defineAction(
  { schema: SetRuleSchema, permission: "settings:manage" },
  async (input, { user }) => {
    const result = await setRuleService(user, input);
    revalidatePath("/settings/checklists");
    revalidatePath("/claims", "layout");
    return result;
  },
);
