import "server-only";
import { listDocumentTypes } from "@/features/catalog/server/queries";
import type { Requirement, Stage } from "@/lib/enums";
import {
  resolveChecklist,
  scopeOf,
  traceRules,
  type RuleInput,
  type RuleScope,
} from "../domain/resolve-checklist";
import type { RuleScopeInput } from "../schemas";
import { loadRules } from "./load-rules";

export type RuleEditorRow = {
  documentType: { id: string; label: string };
  atScope: { requirement: Requirement; needsFreshCopy: boolean; note: string | null } | null;
  inherited: { requirement: Requirement; scope: RuleScope } | null;
  result: "REQUIRED" | "OPTIONAL" | "NONE";
};

export type PreviewStageItem = {
  documentTypeId: string;
  label: string;
  requirement: "REQUIRED" | "OPTIONAL";
  needsFreshCopy: boolean;
  scope: RuleScope;
};

export type PreviewOverride = {
  label: string;
  winner: RuleScope;
  winnerRequirement: Requirement;
  loser: RuleScope;
  loserRequirement: Requirement;
};

export type StagePreviewDto = {
  stage: Stage;
  items: PreviewStageItem[];
  overrides: PreviewOverride[];
};

const SCOPE_RANK: Record<RuleScope, number> = {
  ALL: 0,
  PROCEDURE: 1,
  PAYER: 2,
  PAYER_PROCEDURE: 3,
};

export async function getRuleEditor(scope: RuleScopeInput): Promise<RuleEditorRow[]> {
  const [rules, docTypes] = await Promise.all([loadRules(), listDocumentTypes({ activeOnly: true })]);

  const targetScope = scopeOf(scope);
  const traced = traceRules(rules, scope);

  return docTypes.map((dt) => {
    const list = traced.get(dt.id) ?? [];
    const exact = list.find((r) => scopeOf(r) === targetScope) ?? null;
    const broader = list.find((r) => SCOPE_RANK[scopeOf(r)] < SCOPE_RANK[targetScope]) ?? null;

    const winner = list[0];
    let result: "REQUIRED" | "OPTIONAL" | "NONE" = "NONE";
    if (winner && winner.requirement !== "NOT_NEEDED") {
      result = winner.requirement;
    }

    return {
      documentType: { id: dt.id, label: dt.label },
      atScope: exact
        ? { requirement: exact.requirement, needsFreshCopy: exact.needsFreshCopy, note: null }
        : null,
      inherited: broader ? { requirement: broader.requirement, scope: scopeOf(broader) } : null,
      result,
    };
  });
}

export async function getChecklistPreview(target: {
  payerId: string;
  procedureId: string;
}): Promise<StagePreviewDto[]> {
  const [rules, docTypes] = await Promise.all([loadRules(), listDocumentTypes({ activeOnly: true })]);

  const docTypeMap = new Map(docTypes.map((d) => [d.id, d.label]));
  const stages: Stage[] = ["PRE_AUTH", "ENHANCEMENT", "DISCHARGE"];

  return stages.map((stage) => {
    const stageTarget = { ...target, stage };
    const items = resolveChecklist(rules, stageTarget).map((item) => ({
      documentTypeId: item.documentTypeId,
      label: docTypeMap.get(item.documentTypeId) ?? "Unknown",
      requirement: item.requirement,
      needsFreshCopy: item.needsFreshCopy,
      scope: item.source.scope,
    }));

    const traced = traceRules(rules, stageTarget);
    const overrides: PreviewOverride[] = [];

    for (const [docTypeId, list] of traced.entries()) {
      if (list.length >= 2) {
        const winner = list[0] as RuleInput;
        const loser = list[1] as RuleInput;
        if (winner.requirement !== loser.requirement) {
          overrides.push({
            label: docTypeMap.get(docTypeId) ?? "Document",
            winner: scopeOf(winner),
            winnerRequirement: winner.requirement,
            loser: scopeOf(loser),
            loserRequirement: loser.requirement,
          });
        }
      }
    }

    return { stage, items, overrides };
  });
}
