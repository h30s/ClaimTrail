export type DocumentTypeSeed = {
  sortOrder: number;
  key: string;
  label: string;
  description: string;
};

export const SEED_DOCUMENT_TYPES: readonly DocumentTypeSeed[] = [
  {
    sortOrder: 1,
    key: "PREAUTH_FORM",
    label: "Pre-auth request form",
    description:
      "The cashless request form, usually several pages with patient, policy and treatment sections and signatures.",
  },
  {
    sortOrder: 2,
    key: "POLICY_CARD",
    label: "Insurance / TPA ID card",
    description: "Health card from the insurer or TPA with member ID, policy number and validity dates.",
  },
  {
    sortOrder: 3,
    key: "PHOTO_ID",
    label: "Patient photo ID",
    description:
      "Government photo identity document of the patient (Aadhaar, PAN, voter ID, passport, driving licence).",
  },
  {
    sortOrder: 4,
    key: "DOCTOR_NOTES",
    label: "Doctor's notes",
    description:
      "Treating doctor's consultation, admission or progress notes, often handwritten on a case paper: complaints, findings, diagnosis, plan.",
  },
  {
    sortOrder: 5,
    key: "COST_ESTIMATE",
    label: "Cost estimate",
    description:
      "Hospital's itemised estimate of treatment cost (room, surgery, implants, medicines) with a total.",
  },
  {
    sortOrder: 6,
    key: "ULTRASOUND_REPORT",
    label: "Ultrasound report",
    description: "Sonography (USG) report from radiology with organ findings and an impression.",
  },
  {
    sortOrder: 7,
    key: "XRAY_REPORT",
    label: "X-ray report",
    description: "Radiology X-ray report, for example knee or chest, with findings and impression.",
  },
  {
    sortOrder: 8,
    key: "CBC_REPORT",
    label: "CBC / platelet count report",
    description:
      "Complete blood count lab report listing haemoglobin, WBC and platelet count with reference ranges.",
  },
  {
    sortOrder: 9,
    key: "DENGUE_TEST",
    label: "Dengue test report",
    description: "Lab report for dengue NS1 antigen or IgM/IgG antibodies.",
  },
  {
    sortOrder: 10,
    key: "ANGIOGRAPHY_REPORT",
    label: "Angiography report",
    description: "Coronary angiography report describing blockages in heart vessels.",
  },
  {
    sortOrder: 11,
    key: "IMPLANT_INVOICE",
    label: "Implant invoice / sticker",
    description:
      "Invoice or barcode sticker for an implant such as a knee prosthesis or stent, with batch number and price.",
  },
  {
    sortOrder: 12,
    key: "DISCHARGE_SUMMARY",
    label: "Discharge summary",
    description:
      "Summary written at discharge: diagnosis, treatment given, procedure details, condition at discharge, advice.",
  },
  {
    sortOrder: 13,
    key: "FINAL_BILL",
    label: "Final hospital bill",
    description: "Itemised final bill with bill number, charges by category and total payable.",
  },
  {
    sortOrder: 14,
    key: "PHARMACY_BILLS",
    label: "Pharmacy and consumable bills",
    description: "Bills for medicines and consumables issued during the stay.",
  },
];
