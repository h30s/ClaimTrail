"use server";

import { revalidatePath } from "next/cache";
import { defineAction } from "@/lib/action";
import { UpdateDocumentTypeSchema, UpdatePayerSchema } from "../schemas";
import { updateDocumentType as updateDocTypeService } from "./update-document-type";
import { updatePayer as updatePayerService } from "./update-payer";

export const updateDocumentType = defineAction(
  { schema: UpdateDocumentTypeSchema, permission: "settings:manage" },
  async (input, { user }) => {
    const result = await updateDocTypeService(user, input);
    revalidatePath("/settings", "layout");
    return result;
  },
);

export const updatePayer = defineAction(
  { schema: UpdatePayerSchema, permission: "settings:manage" },
  async (input, { user }) => {
    const result = await updatePayerService(user, input);
    revalidatePath("/settings", "layout");
    return result;
  },
);
