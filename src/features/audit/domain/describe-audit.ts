import type { AuditAction } from "./audit-actions";

export function describeAudit(entry: { action: AuditAction; data?: unknown }): string {
  const d = (entry.data && typeof entry.data === "object" ? entry.data : {}) as Record<string, unknown>;

  switch (entry.action) {
    case "CLAIM_VIEWED":
      return "Viewed claim";
    case "CLAIM_CREATED":
      return d.code ? `Created claim ${d.code}` : "Created claim record";
    case "CLAIM_TRANSITIONED":
      if (d.decision === "APPROVE") {
        return d.approvedAmount
          ? `Approved for ₹${Number(d.approvedAmount).toLocaleString("en-IN")}`
          : "Approved claim";
      }
      if (d.decision === "REJECT") {
        return d.reason ? `Rejected: ${d.reason}` : "Rejected claim";
      }
      if (d.stage) return `Started ${String(d.stage).toLowerCase().replace(/_/g, " ")} stage`;
      return "Updated claim status";
    case "CLAIM_ASSIGNED":
      return d.assigneeName ? `Assigned to ${d.assigneeName}` : "Unassigned claim";
    case "CLAIM_SUBMITTED":
      return d.overridden
        ? `Submitted with override: "${d.overrideReason}"`
        : "Submitted claim packet to payer";
    case "CLAIM_SETTLED":
      return d.settledAmount
        ? `Settled ₹${Number(d.settledAmount).toLocaleString("en-IN")} of ₹${Number(d.billedAmount).toLocaleString("en-IN")}`
        : "Recorded final claim settlement";
    case "DEDUCTION_RECORDED":
      return d.reason ? `Recorded deduction for ${d.reason}` : "Recorded deduction line";
    case "DOCUMENT_UPLOADED":
      return d.fileName ? `Uploaded file "${d.fileName}"` : "Uploaded document file";
    case "DOCUMENT_SORTED":
      return d.targetKey ? `Sorted into ${d.targetKey}` : "Sorted document into slot";
    case "DOCUMENT_ANALYSED":
      return d.aiDocumentTypeKey
        ? `AI classified as ${d.aiDocumentTypeKey} (${Math.round((Number(d.aiConfidence) || 0) * 100)}% confidence)`
        : "Analysed document with AI";
    case "DOCUMENT_MOVED":
      return d.targetKey ? `Moved document to slot ${d.targetKey}` : "Moved document slot";
    case "DOCUMENT_VIEWED":
      return "Viewed document file";
    case "DOCUMENT_REMOVED":
      return "Removed document";
    case "IDENTITY_CONFIRMED":
      return "Confirmed patient identity match on document";
    case "FIELD_CONFIRMED":
      return d.fieldKey ? `Confirmed field ${d.fieldKey}` : "Confirmed pre-auth field";
    case "FIELD_DISMISSED":
      return d.fieldKey ? `Dismissed suggestion for ${d.fieldKey}` : "Dismissed field suggestion";
    case "QUERY_INGESTED":
      return d.subject ? `Ingested email: "${d.subject}"` : "Ingested incoming query email";
    case "QUERY_LINKED":
      return d.claimCode ? `Linked query to ${d.claimCode}` : "Linked query to claim";
    case "QUERY_REPLIED":
      return "Sent reply to TPA query";
    case "PACKET_DOWNLOADED":
      return "Downloaded submission packet PDF";
    case "RULE_UPDATED":
      return d.requirement ? `Updated rule to ${d.requirement}` : "Updated checklist rule";
    case "RULE_REMOVED":
      return "Removed checklist rule";
    case "PAYER_UPDATED":
      return "Updated payer configuration";
    case "DOCUMENT_TYPE_UPDATED":
      return "Updated document type";
    case "DOCTOR_LINK_CREATED":
      return "Created doctor sign-off link";
    case "DOCTOR_DECIDED":
      return d.decision ? `Doctor ${String(d.decision).toLowerCase()}` : "Doctor submitted decision";
    default:
      return "Recorded audit event";
  }
}
