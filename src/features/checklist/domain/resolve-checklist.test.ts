import { describe, expect, it } from "vitest";
import type { Requirement, Stage } from "@/lib/enums";
import { resolveChecklist, traceRules, type ChecklistTarget, type RuleInput } from "./resolve-checklist";

function rule(
  id: string,
  doc: string,
  opt: {
    payerId?: string | null;
    procedureId?: string | null;
    stage?: Stage;
    req?: Requirement;
    fresh?: boolean;
  } = {},
): RuleInput {
  return {
    id,
    documentTypeId: doc,
    payerId: opt.payerId ?? null,
    procedureId: opt.procedureId ?? null,
    stage: opt.stage ?? "PRE_AUTH",
    requirement: opt.req ?? "REQUIRED",
    needsFreshCopy: opt.fresh ?? false,
  };
}

describe("resolveChecklist", () => {
  const target: ChecklistTarget = {
    payerId: "payer-b",
    procedureId: "proc-gallbladder",
    stage: "PRE_AUTH",
  };

  it("returns global rules as-is when no specific rules exist", () => {
    const rules = [rule("r1", "form")];
    const items = resolveChecklist(rules, target);
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({
      documentTypeId: "form",
      requirement: "REQUIRED",
      needsFreshCopy: false,
      source: { ruleId: "r1", scope: "ALL" },
    });
  });

  it("adds a procedure document that global rules do not have", () => {
    const rules = [rule("r1", "form"), rule("r2", "usg", { procedureId: "proc-gallbladder" })];
    const items = resolveChecklist(rules, target);
    expect(items.map((i) => i.documentTypeId)).toContain("usg");
    expect(items.find((i) => i.documentTypeId === "usg")?.source.scope).toBe("PROCEDURE");
  });

  it("removes a globally required document when payer rule is NOT_NEEDED", () => {
    const rules = [rule("r1", "id"), rule("r2", "id", { payerId: "payer-b", req: "NOT_NEEDED" })];
    const items = resolveChecklist(rules, target);
    expect(items.find((i) => i.documentTypeId === "id")).toBeUndefined();
  });

  it("ensures payer rule beats procedure rule for the same document type (A6)", () => {
    const rules = [
      rule("r-proc", "cbc", { procedureId: "proc-gallbladder", req: "OPTIONAL" }),
      rule("r-payer", "cbc", { payerId: "payer-b", req: "REQUIRED", fresh: true }),
    ];
    const items = resolveChecklist(rules, target);
    const cbc = items.find((i) => i.documentTypeId === "cbc");
    expect(cbc?.requirement).toBe("REQUIRED");
    expect(cbc?.source.scope).toBe("PAYER");
    expect(cbc?.needsFreshCopy).toBe(true);
  });

  it("ensures payer + procedure rule beats payer rule", () => {
    const rules = [
      rule("r-payer", "cbc", { payerId: "payer-b", req: "OPTIONAL" }),
      rule("r-pp", "cbc", { payerId: "payer-b", procedureId: "proc-gallbladder", req: "REQUIRED" }),
    ];
    const items = resolveChecklist(rules, target);
    expect(items.find((i) => i.documentTypeId === "cbc")?.source.scope).toBe("PAYER_PROCEDURE");
  });

  it("ignores rules for other payers, procedures, or stages", () => {
    const rules = [
      rule("r-other", "doc", { payerId: "other" }),
      rule("r-stage", "doc", { payerId: "payer-b", stage: "DISCHARGE" }),
    ];
    expect(resolveChecklist(rules, target)).toHaveLength(0);
  });

  it("takes needsFreshCopy from the winning rule, ignoring lower ones", () => {
    const rules = [
      rule("r-glob", "est", { fresh: true }),
      rule("r-payer", "est", { payerId: "payer-b", fresh: false }),
    ];
    const items = resolveChecklist(rules, target);
    expect(items[0]?.needsFreshCopy).toBe(false);
  });

  it("returns empty checklist for empty rules", () => {
    expect(resolveChecklist([], target)).toEqual([]);
  });

  it("traceRules lists overridden rules in descending order of specificity", () => {
    const rules = [
      rule("r-glob", "cbc", { req: "OPTIONAL" }),
      rule("r-pp", "cbc", { payerId: "payer-b", procedureId: "proc-gallbladder", req: "REQUIRED" }),
    ];
    const trace = traceRules(rules, target);
    expect(trace.get("cbc")?.map((r) => r.id)).toEqual(["r-pp", "r-glob"]);
  });

  it("ignores payer rules when target payerId is null (editing all payers scope)", () => {
    const editScope: ChecklistTarget = { payerId: null, procedureId: "proc-gallbladder", stage: "PRE_AUTH" };
    const rules = [
      rule("r-payer", "doc1", { payerId: "payer-b" }),
      rule("r-proc", "doc1", { procedureId: "proc-gallbladder", req: "OPTIONAL" }),
    ];
    const items = resolveChecklist(rules, editScope);
    expect(items[0]?.requirement).toBe("OPTIONAL");
    expect(items[0]?.source.scope).toBe("PROCEDURE");
  });
});
