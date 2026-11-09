export type SeedQueryDef = {
  key: string;
  fromAddress: string;
  payerName: string;
  claimCode: string | null;
  suggestedClaimCode: string | null;
  minutesAgo: number;
  subject: string;
  body: string;
  summary: string;
  extractedClaimRef: string | null;
  extractedPatient: string | null;
  deadlineSource: "STATED" | "DEFAULT";
  statedSnippet: string | null;
  deadlineMinutesOffset: number; // offset from receivedAt in minutes (e.g. +360 for 6 hours)
  status: "OPEN" | "ANSWERED";
  repliedMinutesAfter?: number;
  replyBody?: string;
  asks: Array<{
    position: number;
    text: string;
    documentTypeKey: string | null;
    sourceSnippet: string;
  }>;
};

export const SEED_QUERY_SPECS: SeedQueryDef[] = [
  // Q1: CLM-3384 - Company F, Suresh Wagh (Amber countdown chip: due in ~75 min)
  // Received 105 min ago, stated deadline 3 hours (180 min) -> 75 min remaining (< 2h)
  {
    key: "Q1",
    fromAddress: "queries@company-f.example",
    payerName: "Company F",
    claimCode: "CLM-3384",
    suggestedClaimCode: null,
    minutesAgo: 105,
    subject: "Ref: CLM-3384 / Suresh Wagh - Urgent Stent Specification Clarification",
    body: `Dear Hospital Insurance Desk,

Ref: CLM-3384 / Suresh Wagh (UHID: NSK-204504)
Policy: DEMO-F-551029

Please provide the coronary angiography report and stent technical specification before authorization.
Respond within 3 hours to avoid turnaround breach.

Regards,
Company F TPA Desk`,
    summary: "Company F requires angiography report and stent specifications within 3 hours.",
    extractedClaimRef: "CLM-3384",
    extractedPatient: "Suresh Wagh",
    deadlineSource: "STATED",
    statedSnippet: "within 3 hours",
    deadlineMinutesOffset: 180, // 3 hours
    status: "OPEN",
    asks: [
      {
        position: 1,
        text: "Angiography report and stent technical specification",
        documentTypeKey: "ANGIOGRAPHY_REPORT",
        sourceSnippet: "coronary angiography report and stent technical specification",
      },
    ],
  },

  // Q2: CLM-3388 - Company D (TPA), Pneumonia treatment, Anil Jadhav
  // Received 4h 35m ago (275 min ago), deadline +4h (240 min) -> overdue by 35 min!
  {
    key: "Q2",
    fromAddress: "cashless@company-d.example",
    payerName: "Company D",
    claimCode: "CLM-3388",
    suggestedClaimCode: null,
    minutesAgo: 275,
    subject: "Claim CLM-3388, Anil Jadhav - Query on Pre-Authorization Request",
    body: `Dear TPA Desk,

Claim CLM-3388, Anil Jadhav.
Before our medical panel can decide on pre-auth authorization:
1. Indoor case papers from admission with vitals and doctor's examination notes.
2. Chest X-ray report and film confirming consolidation/pneumonia.

Please respond within 4 hours of this mail. Late replies may lead to cashless denial.

Regards,
Cashless Query Team
Company D Healthcare TPA`,
    summary: "Company D requires indoor case papers and chest X-ray report within 4 hours.",
    extractedClaimRef: "CLM-3388",
    extractedPatient: "Anil Jadhav",
    deadlineSource: "STATED",
    statedSnippet: "within 4 hours of this mail",
    deadlineMinutesOffset: 240, // 4 hours
    status: "OPEN",
    asks: [
      {
        position: 1,
        text: "Indoor case papers from admission with doctor examination notes",
        documentTypeKey: "DOCTOR_NOTES",
        sourceSnippet: "1. Indoor case papers from admission with vitals and doctor's examination notes",
      },
      {
        position: 2,
        text: "Chest X-ray report confirming consolidation",
        documentTypeKey: "XRAY_REPORT",
        sourceSnippet: "2. Chest X-ray report and film confirming consolidation/pneumonia",
      },
    ],
  },

  // Q3: Unmatched - Company E, Mr. Vikas More -> Suggests CLM-3392
  // Received 3h ago (180 min ago), default 24h -> ~21h remaining
  {
    key: "Q3",
    fromAddress: "claims.desk@company-e.example",
    payerName: "Company E",
    claimCode: null,
    suggestedClaimCode: "CLM-3392",
    minutesAgo: 180,
    subject: "Pre-Auth Clarification - Patient: Mr. Vikas More, Policy DEMO-E-449201",
    body: `Dear Cashless Coordinator,

Patient: Mr. Vikas More
Policy DEMO-E-449201

We have received a pre-auth intimation. Please send previous consultation papers for the abdominal pain and mention the date of first consultation.
Kindly furnish details at the earliest.

Regards,
Claims Query Processing Cell
Company E Health Insurance`,
    summary:
      "Company E requests previous consultation papers and date of first consultation for Mr. Vikas More.",
    extractedClaimRef: null,
    extractedPatient: "Vikas More",
    deadlineSource: "DEFAULT",
    statedSnippet: null,
    deadlineMinutesOffset: 1440, // 24 hours default
    status: "OPEN",
    asks: [
      {
        position: 1,
        text: "Previous consultation papers for abdominal pain",
        documentTypeKey: "DOCTOR_NOTES",
        sourceSnippet: "send previous consultation papers for the abdominal pain",
      },
      {
        position: 2,
        text: "Mention date of first consultation",
        documentTypeKey: null,
        sourceSnippet: "mention the date of first consultation",
      },
    ],
  },

  // Q4: CLM-3390 - Company E, Rohit Pagar (Dengue)
  // Received yesterday at 11:00 IST (approx 1440 min ago), Answered yesterday at 13:15 IST (on time)
  {
    key: "Q4",
    fromAddress: "claims.desk@company-e.example",
    payerName: "Company E",
    claimCode: "CLM-3390",
    suggestedClaimCode: null,
    minutesAgo: 1440,
    subject: "CLM-3390: Pre-auth Query - Dengue Investigation",
    body: `Dear Hospital,

CLM-3390: share NS1 antigen report and latest platelet count for patient Rohit Pagar.

Regards,
Company E Desk`,
    summary: "Company E requests NS1 antigen report and platelet count for CLM-3390.",
    extractedClaimRef: "CLM-3390",
    extractedPatient: "Rohit Pagar",
    deadlineSource: "DEFAULT",
    statedSnippet: null,
    deadlineMinutesOffset: 1440,
    status: "ANSWERED",
    repliedMinutesAfter: 135, // 2h 15m after receipt -> answered on time
    replyBody: `Dear Company E Team,

Please find attached the NS1 antigen positive test report and latest platelet report (42,000/mcL) for patient Rohit Pagar (CLM-3390).

Regards,
Arjun Patil
Company A Multispeciality Hospital, Nashik`,
    asks: [
      {
        position: 1,
        text: "NS1 antigen report and platelet count",
        documentTypeKey: "CBC_REPORT",
        sourceSnippet: "share NS1 antigen report and latest platelet count",
      },
    ],
  },
];
