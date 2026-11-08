import type { SeedDocDef } from "./documents";

export const SUPPORTING_DOCUMENT_SPECS: SeedDocDef[] = [
  // CLM-3383: Kavita Nikam (Caesarean, 1 in Tray)
  {
    claimCode: "CLM-3383",
    typeKey: "DOCTOR_NOTES",
    fileName: "obgyn-notes-kavita-nikam.pdf",
    title: "Obstetrics & Gynaecology Clinical Notes",
    patientNameOnDoc: "Kavita Nikam",
    minutesAgo: 45,
    confidence: 0.93,
    lines: [
      "Primi at 38 weeks gestation with severe oligohydramnios (AFI 4 cm)",
      "Fetal distress noted on non-stress test",
      "Emergency LSCS indicated in maternal and fetal interest",
    ],
  },
  {
    claimCode: "CLM-3383",
    typeKey: "PHOTO_ID",
    fileName: "aadhaar-kavita-nikam.pdf",
    title: "Aadhaar Card",
    patientNameOnDoc: "Kavita Nikam",
    minutesAgo: 45,
    confidence: 0.95,
    lines: ["DOB: 15/06/1992", "Gender: Female", "Nashik"],
  },
  {
    claimCode: "CLM-3383",
    typeKey: null, // In tray!
    fileName: "blurry-scan-pelvis-usg.pdf",
    title: "Ultrasound Obstetric Scan (Low Quality)",
    patientNameOnDoc: "Kavita Nikam",
    status: "NEEDS_REVIEW",
    confidence: 0.55,
    reason: "Document scan is blurry and low resolution; checklist match uncertain",
    alternatives: [
      { documentType: "ULTRASOUND_REPORT", confidence: 0.55 },
      { documentType: "DOCTOR_NOTES", confidence: 0.25 },
    ],
    minutesAgo: 40,
    lines: [
      "Scan Image Quality: Degraded / Sub-optimal",
      "Single live intrauterine gestation...",
      "Presentation cephalic... Liquor severely reduced...",
    ],
  },

  // CLM-3391: Meena Gaikwad (Wrong patient document demonstration)
  {
    claimCode: "CLM-3391",
    typeKey: "DOCTOR_NOTES",
    fileName: "admission-notes-meena-gaikwad.pdf",
    title: "Admission Case Paper",
    patientNameOnDoc: "Meena Gaikwad",
    identityCheck: "MATCH",
    minutesAgo: 60,
    confidence: 0.93,
    lines: [
      "Patient: Meena Gaikwad | Age: 49 / F",
      "Symptomatic Gallstones with biliary colic",
      "Advised Lap Cholecystectomy",
    ],
  },
  {
    claimCode: "CLM-3391",
    typeKey: "CBC_REPORT",
    fileName: "cbc-report-sunanda-gaikwad.pdf",
    title: "Complete Blood Count Report",
    patientNameOnDoc: "Sunanda Gaikwad", // MISMATCH with Meena Gaikwad!
    identityCheck: "MISMATCH",
    minutesAgo: 55,
    confidence: 0.95,
    lines: [
      "Patient Name on Slip: Mrs. Sunanda Gaikwad",
      "Haemoglobin: 12.1 g/dL",
      "Platelet Count: 1,95,000 /mcL",
      "WBC: 8,400 /mcL",
    ],
  },
];
