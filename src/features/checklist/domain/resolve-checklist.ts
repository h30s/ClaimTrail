// Which documents a claim needs at a stage. For each document type the most specific
// matching rule wins: payer+procedure > payer > procedure > all (A6).
// NOT_NEEDED at a more specific scope is how a payer waives a general requirement.
import type { Requirement, Stage } from "@/lib/enums";

export type RuleScope = "ALL" | "PROCEDURE" | "PAYER" | "PAYER_PROCEDURE";

export type RuleInput = {
  id: string;
  payerId: string | null;
  procedureId: string | null;
  stage: Stage;
  documentTypeId: string;
  requirement: Requirement;
  needsFreshCopy: boolean;
};

/** null = an "all payers" / "all procedures" scope, used by the admin editor. */
export type ChecklistTarget = {
  payerId: string | null;
  procedureId: string | null;
  stage: Stage;
};

export type ChecklistItem = {
  documentTypeId: string;
  requirement: "REQUIRED" | "OPTIONAL";
  needsFreshCopy: boolean;
  source: { ruleId: string; scope: RuleScope };
};

const SCOPE_RANK: Record<RuleScope, number> = {
  ALL: 0,
  PROCEDURE: 1,
  PAYER: 2,
  PAYER_PROCEDURE: 3,
};

export function scopeOf(rule: Pick<RuleInput, "payerId" | "procedureId">): RuleScope {
  if (rule.payerId && rule.procedureId) return "PAYER_PROCEDURE";
  if (rule.payerId) return "PAYER";
  if (rule.procedureId) return "PROCEDURE";
  return "ALL";
}

function appliesTo(rule: RuleInput, target: ChecklistTarget): boolean {
  return (
    rule.stage === target.stage &&
    (rule.payerId === null || rule.payerId === target.payerId) &&
    (rule.procedureId === null || rule.procedureId === target.procedureId)
  );
}

/** All matching rules per document type, most specific first. Used by the admin preview to show overrides. */
export function traceRules(rules: RuleInput[], target: ChecklistTarget): Map<string, RuleInput[]> {
  const byType = new Map<string, RuleInput[]>();
  for (const rule of rules) {
    if (!appliesTo(rule, target)) continue;
    byType.set(rule.documentTypeId, [...(byType.get(rule.documentTypeId) ?? []), rule]);
  }
  for (const list of byType.values()) {
    list.sort((a, b) => SCOPE_RANK[scopeOf(b)] - SCOPE_RANK[scopeOf(a)]);
  }
  return byType;
}

export function resolveChecklist(rules: RuleInput[], target: ChecklistTarget): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  for (const [documentTypeId, [winner]] of traceRules(rules, target)) {
    if (!winner || winner.requirement === "NOT_NEEDED") continue;
    items.push({
      documentTypeId,
      requirement: winner.requirement,
      needsFreshCopy: winner.needsFreshCopy,
      source: { ruleId: winner.id, scope: scopeOf(winner) },
    });
  }
  return items;
}
