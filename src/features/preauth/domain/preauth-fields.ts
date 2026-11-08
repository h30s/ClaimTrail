// The pre-auth fields we pre-fill and confirm (A9). Drives the AI schema, the form,
// validation and the packet cover page, so a new field is a one-line change.
export const PREAUTH_FIELDS = [
  {
    key: "patientName",
    label: "Patient name",
    group: "Patient",
    kind: "text",
    aiHint: "Full name as written on the document",
  },
  {
    key: "age",
    label: "Age (years)",
    group: "Patient",
    kind: "integer",
    aiHint: "Age in years",
  },
  {
    key: "gender",
    label: "Gender",
    group: "Patient",
    kind: "gender",
    aiHint: "MALE, FEMALE or OTHER",
  },
  {
    key: "policyNumber",
    label: "Policy number",
    group: "Policy",
    kind: "text",
    aiHint: "Insurance policy number",
  },
  {
    key: "memberId",
    label: "Member / TPA ID",
    group: "Policy",
    kind: "text",
    aiHint: "Member, card or TPA ID number",
  },
  {
    key: "admissionDate",
    label: "Date of admission",
    group: "Admission",
    kind: "date",
    aiHint: "YYYY-MM-DD",
  },
  {
    key: "treatingDoctor",
    label: "Treating doctor",
    group: "Admission",
    kind: "text",
    aiHint: "Doctor's name",
  },
  {
    key: "chiefComplaints",
    label: "Presenting complaints",
    group: "Clinical",
    kind: "longText",
    aiHint: "Symptoms and duration",
  },
  {
    key: "provisionalDiagnosis",
    label: "Provisional diagnosis",
    group: "Clinical",
    kind: "text",
    aiHint: "Diagnosis as written",
  },
  {
    key: "proposedTreatment",
    label: "Proposed treatment",
    group: "Clinical",
    kind: "text",
    aiHint: "Planned procedure or line of treatment",
  },
  {
    key: "expectedStayDays",
    label: "Expected stay (days)",
    group: "Cost",
    kind: "integer",
    aiHint: "Expected length of stay in days",
  },
  {
    key: "estimatedCost",
    label: "Estimated cost (₹)",
    group: "Cost",
    kind: "rupees",
    aiHint: "Total estimate in rupees, digits only",
  },
] as const;

export type PreauthField = (typeof PREAUTH_FIELDS)[number];
export type PreauthFieldKey = PreauthField["key"];
export const PREAUTH_FIELD_KEYS = PREAUTH_FIELDS.map((f) => f.key) as [PreauthFieldKey, ...PreauthFieldKey[]];
