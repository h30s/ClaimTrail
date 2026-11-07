import "server-only";
import { db } from "@/lib/db";
import type { RuleInput } from "../domain/resolve-checklist";

export async function loadRules(): Promise<RuleInput[]> {
  const rules = await db.checklistRule.findMany({
    select: {
      id: true,
      payerId: true,
      procedureId: true,
      stage: true,
      documentTypeId: true,
      requirement: true,
      needsFreshCopy: true,
    },
  });
  return rules;
}
