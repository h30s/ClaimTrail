// Writes one audit row. Always called with the transaction client of the change it describes (I5).
import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { AuditAction } from "../domain/audit-actions";

type Writer = Pick<Prisma.TransactionClient, "auditEvent">;

export type AuditEntry = {
  actorId: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  claimId?: string;
  data?: Prisma.InputJsonValue;
};

export function recordAudit(writer: Writer, entry: AuditEntry) {
  return writer.auditEvent.create({ data: entry });
}
