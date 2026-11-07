// Turns "what the payer needs" and "what we hold" into slot states.
// Fresh-copy slots only count documents uploaded after the stage started (A7);
// a query ask only counts documents uploaded after the query arrived.
import type { DocumentStatus, IdentityCheck } from "@/lib/enums";
import type { ChecklistItem } from "./resolve-checklist";

export type GapDocument = {
  id: string;
  documentTypeId: string | null;
  status: DocumentStatus;
  identityCheck: IdentityCheck;
  uploadedAt: Date;
};

export type SlotState = "SATISFIED" | "MISSING" | "STALE" | "NEEDS_CHECK";
export type Slot = {
  item: ChecklistItem;
  state: SlotState;
  documents: GapDocument[];
};

export type AskInput = {
  id: string;
  queryId: string;
  text: string;
  documentTypeId: string | null;
  receivedAt: Date;
};

export type AskState = "SATISFIED" | "MISSING" | "ANSWER_IN_REPLY";
export type AskSlot = { ask: AskInput; state: AskState };

export type GapReport = {
  slots: Slot[];
  asks: AskSlot[];
  otherDocuments: GapDocument[]; // sorted, but not in this stage's checklist
  unsortedCount: number;
  missingRequired: number;
  staleRequired: number;
  needsCheck: number;
  isReady: boolean;
};

const BLOCKING: SlotState[] = ["MISSING", "STALE", "NEEDS_CHECK"];

function usable(doc: GapDocument): boolean {
  return doc.status === "SORTED" && doc.identityCheck !== "MISMATCH";
}

function slotState(item: ChecklistItem, ofType: GapDocument[], stageStartedAt: Date): SlotState {
  const inWindow = item.needsFreshCopy ? ofType.filter((d) => d.uploadedAt >= stageStartedAt) : ofType;

  if (inWindow.some(usable)) return "SATISFIED";
  if (inWindow.length > 0) return "NEEDS_CHECK"; // only mismatched-name documents
  return ofType.length > 0 ? "STALE" : "MISSING";
}

function askState(ask: AskInput, docs: GapDocument[]): AskState {
  if (!ask.documentTypeId) return "ANSWER_IN_REPLY";
  const fresh = docs.some(
    (d) => d.documentTypeId === ask.documentTypeId && d.uploadedAt >= ask.receivedAt && usable(d),
  );
  return fresh ? "SATISFIED" : "MISSING";
}

export function computeGaps(input: {
  items: ChecklistItem[];
  documents: GapDocument[]; // caller excludes soft-deleted documents (I7)
  stageStartedAt: Date;
  openAsks: AskInput[];
}): GapReport {
  const sorted = input.documents.filter((d) => d.status === "SORTED");
  const slots = input.items.map((item) => {
    const ofType = sorted.filter((d) => d.documentTypeId === item.documentTypeId);
    return { item, state: slotState(item, ofType, input.stageStartedAt), documents: ofType };
  });

  const required = slots.filter((s) => s.item.requirement === "REQUIRED");
  const asks = input.openAsks.map((ask) => ({ ask, state: askState(ask, sorted) }));
  const checklistTypes = new Set(input.items.map((i) => i.documentTypeId));

  return {
    slots,
    asks,
    otherDocuments: sorted.filter((d) => !d.documentTypeId || !checklistTypes.has(d.documentTypeId)),
    unsortedCount: input.documents.filter((d) => d.status !== "SORTED").length,
    missingRequired: required.filter((s) => s.state === "MISSING").length,
    staleRequired: required.filter((s) => s.state === "STALE").length,
    needsCheck: slots.filter((s) => s.state === "NEEDS_CHECK").length,
    isReady: !required.some((s) => BLOCKING.includes(s.state)) && !asks.some((a) => a.state === "MISSING"),
  };
}
