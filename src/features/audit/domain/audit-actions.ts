export type AuditAction =
  | "CLAIM_VIEWED"
  | "CLAIM_CREATED"
  | "CLAIM_TRANSITIONED"
  | "CLAIM_ASSIGNED"
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_SORTED"
  | "DOCUMENT_ANALYSED"
  | "DOCUMENT_MOVED"
  | "DOCUMENT_VIEWED"
  | "DOCUMENT_REMOVED"
  | "IDENTITY_CONFIRMED"
  | "FIELD_CONFIRMED"
  | "FIELD_DISMISSED"
  | "QUERY_LINKED"
  | "QUERY_REPLIED"
  | "CLAIM_SUBMITTED"
  | "PACKET_DOWNLOADED"
  | "DEDUCTION_RECORDED"
  | "RULE_UPDATED"
  | "RULE_REMOVED"
  | "PAYER_UPDATED"
  | "DOCUMENT_TYPE_UPDATED";

export const AUDIT_ACTION_LABEL: Record<AuditAction, string> = {
  CLAIM_VIEWED: "Viewed claim",
  CLAIM_CREATED: "Created claim",
  CLAIM_TRANSITIONED: "Changed status",
  CLAIM_ASSIGNED: "Assigned claim",
  DOCUMENT_UPLOADED: "Uploaded document",
  DOCUMENT_SORTED: "Sorted document",
  DOCUMENT_ANALYSED: "Analysed document with AI",
  DOCUMENT_MOVED: "Moved document slot",
  DOCUMENT_VIEWED: "Viewed document file",
  DOCUMENT_REMOVED: "Removed document",
  IDENTITY_CONFIRMED: "Confirmed patient identity",
  FIELD_CONFIRMED: "Confirmed field",
  FIELD_DISMISSED: "Dismissed field",
  QUERY_LINKED: "Linked query",
  QUERY_REPLIED: "Recorded reply",
  CLAIM_SUBMITTED: "Submitted claim",
  PACKET_DOWNLOADED: "Downloaded submission packet",
  DEDUCTION_RECORDED: "Recorded deduction",
  RULE_UPDATED: "Updated checklist rule",
  RULE_REMOVED: "Removed checklist rule",
  PAYER_UPDATED: "Updated payer settings",
  DOCUMENT_TYPE_UPDATED: "Updated document type",
};
