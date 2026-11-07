import type { Requirement, Stage } from "@/lib/enums";

export type ChecklistRuleSeed = {
  payerName?: string;
  procedureName?: string;
  stage: Stage;
  documentTypeKey: string;
  requirement: Requirement;
  needsFreshCopy?: boolean;
  note?: string;
};

export const SEED_CHECKLIST_RULES: readonly ChecklistRuleSeed[] = [
  // 1. All · All (PRE_AUTH)
  { stage: "PRE_AUTH", documentTypeKey: "PREAUTH_FORM", requirement: "REQUIRED" },
  { stage: "PRE_AUTH", documentTypeKey: "POLICY_CARD", requirement: "REQUIRED" },
  { stage: "PRE_AUTH", documentTypeKey: "PHOTO_ID", requirement: "REQUIRED" },
  { stage: "PRE_AUTH", documentTypeKey: "DOCTOR_NOTES", requirement: "REQUIRED" },
  { stage: "PRE_AUTH", documentTypeKey: "COST_ESTIMATE", requirement: "REQUIRED" },

  // 2. All · All (ENHANCEMENT)
  {
    stage: "ENHANCEMENT",
    documentTypeKey: "DOCTOR_NOTES",
    requirement: "REQUIRED",
    needsFreshCopy: true,
    note: "Updated notes and revised estimate",
  },
  {
    stage: "ENHANCEMENT",
    documentTypeKey: "COST_ESTIMATE",
    requirement: "REQUIRED",
    needsFreshCopy: true,
    note: "Updated notes and revised estimate",
  },

  // 3. All · All (DISCHARGE)
  { stage: "DISCHARGE", documentTypeKey: "DISCHARGE_SUMMARY", requirement: "REQUIRED" },
  { stage: "DISCHARGE", documentTypeKey: "FINAL_BILL", requirement: "REQUIRED" },
  { stage: "DISCHARGE", documentTypeKey: "PHARMACY_BILLS", requirement: "REQUIRED" },
  { stage: "DISCHARGE", documentTypeKey: "POLICY_CARD", requirement: "REQUIRED" },

  // 4. Procedure-specific rules
  {
    procedureName: "Gall bladder removal",
    stage: "PRE_AUTH",
    documentTypeKey: "ULTRASOUND_REPORT",
    requirement: "REQUIRED",
  },
  {
    procedureName: "Appendix removal",
    stage: "PRE_AUTH",
    documentTypeKey: "ULTRASOUND_REPORT",
    requirement: "REQUIRED",
  },
  {
    procedureName: "Appendix removal",
    stage: "PRE_AUTH",
    documentTypeKey: "CBC_REPORT",
    requirement: "OPTIONAL",
  },
  {
    procedureName: "Total knee replacement",
    stage: "PRE_AUTH",
    documentTypeKey: "XRAY_REPORT",
    requirement: "REQUIRED",
  },
  {
    procedureName: "Total knee replacement",
    stage: "DISCHARGE",
    documentTypeKey: "IMPLANT_INVOICE",
    requirement: "REQUIRED",
  },
  {
    procedureName: "Coronary angioplasty",
    stage: "PRE_AUTH",
    documentTypeKey: "ANGIOGRAPHY_REPORT",
    requirement: "REQUIRED",
  },
  {
    procedureName: "Coronary angioplasty",
    stage: "DISCHARGE",
    documentTypeKey: "IMPLANT_INVOICE",
    requirement: "REQUIRED",
    note: "Stent sticker",
  },
  {
    procedureName: "Dengue with low platelets",
    stage: "PRE_AUTH",
    documentTypeKey: "CBC_REPORT",
    requirement: "REQUIRED",
  },
  {
    procedureName: "Dengue with low platelets",
    stage: "PRE_AUTH",
    documentTypeKey: "DENGUE_TEST",
    requirement: "REQUIRED",
  },
  {
    procedureName: "Dengue with low platelets",
    stage: "ENHANCEMENT",
    documentTypeKey: "CBC_REPORT",
    requirement: "REQUIRED",
    needsFreshCopy: true,
    note: "Latest platelet count",
  },

  // 5. Payer-specific rules
  {
    payerName: "Company C",
    stage: "PRE_AUTH",
    documentTypeKey: "PHOTO_ID",
    requirement: "NOT_NEEDED",
    note: "Company C verifies identity from the policy card",
  },
  {
    payerName: "Company D",
    stage: "DISCHARGE",
    documentTypeKey: "PHARMACY_BILLS",
    requirement: "OPTIONAL",
    note: "Accepts pharmacy totals within the final bill",
  },

  // 6. Payer + Procedure specific rule
  {
    payerName: "Company B",
    procedureName: "Gall bladder removal",
    stage: "PRE_AUTH",
    documentTypeKey: "CBC_REPORT",
    requirement: "REQUIRED",
    note: "Company B asks for blood work before laparoscopic surgery",
  },
];
