"use server";

import { revalidatePath } from "next/cache";
import { defineAction } from "@/lib/action";
import {
  AssignClaimSchema,
  CreateClaimSchema,
  RecordDecisionSchema,
  SearchPatientsSchema,
  StartStageSchema,
} from "../schemas";
import { assignClaim as assignClaimOp } from "./assign-claim";
import { createClaim as createClaimOp } from "./create-claim";
import { recordDecision as recordDecisionOp } from "./record-decision";
import { searchPatients as searchPatientsOp } from "./search-patients";
import { startStage as startStageOp } from "./start-stage";

export const createClaim = defineAction(
  { schema: CreateClaimSchema, permission: "claim:create" },
  async (input, { user }) => {
    const res = await createClaimOp(user, input);
    revalidatePath("/claims");
    return res;
  },
);

export const recordDecision = defineAction(
  { schema: RecordDecisionSchema, permission: "claim:work" },
  async (input, { user }) => {
    await recordDecisionOp(user, input);
    revalidatePath("/claims");
    revalidatePath(`/claims`, "layout");
    return { success: true };
  },
);

export const startStage = defineAction(
  { schema: StartStageSchema, permission: "claim:work" },
  async (input, { user }) => {
    await startStageOp(user, input);
    revalidatePath("/claims");
    revalidatePath(`/claims`, "layout");
    return { success: true };
  },
);

export const assignClaim = defineAction(
  { schema: AssignClaimSchema, permission: "claim:assign" },
  async (input, { user }) => {
    await assignClaimOp(user, input);
    revalidatePath("/claims");
    revalidatePath(`/claims`, "layout");
    return { success: true };
  },
);

export const searchPatients = defineAction(
  { schema: SearchPatientsSchema, permission: "claim:create" },
  async (input) => {
    return searchPatientsOp(input.q);
  },
);
