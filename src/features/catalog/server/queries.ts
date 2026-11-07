import "server-only";
import { db } from "@/lib/db";
import type { PayerKind } from "@/lib/enums";

export type PayerDto = {
  id: string;
  name: string;
  kind: PayerKind;
  emailDomain: string;
  queryReplyHours: number;
  active: boolean;
};

export type ProcedureDto = {
  id: string;
  name: string;
  active: boolean;
};

export type DocumentTypeDto = {
  id: string;
  key: string;
  label: string;
  description: string;
  sortOrder: number;
  active: boolean;
};

export async function listPayers(options: { activeOnly?: boolean } = {}): Promise<PayerDto[]> {
  const where = options.activeOnly ? { active: true } : {};
  const payers = await db.payer.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      kind: true,
      emailDomain: true,
      queryReplyHours: true,
      active: true,
    },
  });
  return payers;
}

export async function listProcedures(options: { activeOnly?: boolean } = {}): Promise<ProcedureDto[]> {
  const where = options.activeOnly ? { active: true } : {};
  return db.procedure.findMany({
    where,
    orderBy: { name: "asc" },
    select: { id: true, name: true, active: true },
  });
}

export async function listDocumentTypes(options: { activeOnly?: boolean } = {}): Promise<DocumentTypeDto[]> {
  const where = options.activeOnly ? { active: true } : {};
  return db.documentType.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      key: true,
      label: true,
      description: true,
      sortOrder: true,
      active: true,
    },
  });
}
