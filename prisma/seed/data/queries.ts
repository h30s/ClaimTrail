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
  // Q1: CLM-3381 - Company B (TPA), Gall bladder removal, Rajendra Pawar
  // Received 2h 20m ago (140 min ago), deadline +6h -> due in ~3h 40m
  {
    key: "Q1",
    fromAddress: "queries@company-b.example",
    payerName: "Company B",
    claimCode: "CLM-3381",
    suggestedClaimCode: null,
    minutesAgo: 140,
    subject: "Ref: CLM-3381 / Rajendra Pawar - Additional Medical Information Required",
    body: `Dear Hospital Insurance Desk,

Ref: CLM-3381 / Rajendra Pawar (UHID: NSK-204518)
Policy: POL-B-991024

We are reviewing the cashless pre-authorization request for the planned Laparoscopic Cholecystectomy.
Before processing approval, please share the following:
1. USG abdomen report supporting the clinical diagnosis of acute cholecystitis with cholelithiasis.
2. Please confirm the exact duration of present symptoms and previous episodes of abdominal pain.

Kindly submit these requirements within 6 hours to process the cashless request without delay.

Regards,
Medical Query Desk
Company B Health TPA`,
    summary: "Company B requests USG abdomen report and confirmation of symptom duration within 6 hours.",
    extractedClaimRef: "CLM-3381",
    extractedPatient: "Rajendra Pawar",
    deadlineSource: "STATED",
    statedSnippet: "within 6 hours",
    deadlineMinutesOffset: 360, // 6 hours
    status: "OPEN",
    asks: [
      {
        position: 1,
        text: "USG abdomen report supporting diagnosis of cholecystitis",
        documentTypeKey: "ULTRASOUND_REPORT",
        sourceSnippet:
          "USG abdomen report supporting the clinical diagnosis of acute cholecystitis with cholelithiasis",
      },
      {
        position: 2,
        text: "Confirm duration of symptoms and previous pain episodes",
        documentTypeKey: null,
        sourceSnippet:
          "confirm the exact duration of present symptoms and previous episodes of abdominal pain",
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
