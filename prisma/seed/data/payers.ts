import type { PayerKind } from "@/lib/enums";

export type PayerSeed = {
  name: string;
  kind: PayerKind;
  emailDomain: string;
  queryReplyHours: number;
};

export const SEED_PAYERS: readonly PayerSeed[] = [
  { name: "Company B", kind: "TPA", emailDomain: "company-b.example", queryReplyHours: 24 },
  { name: "Company C", kind: "INSURER", emailDomain: "company-c.example", queryReplyHours: 24 },
  { name: "Company D", kind: "TPA", emailDomain: "company-d.example", queryReplyHours: 12 },
  { name: "Company E", kind: "INSURER", emailDomain: "company-e.example", queryReplyHours: 24 },
  { name: "Company F", kind: "TPA", emailDomain: "company-f.example", queryReplyHours: 48 },
  { name: "Company G", kind: "INSURER", emailDomain: "company-g.example", queryReplyHours: 24 },
];
