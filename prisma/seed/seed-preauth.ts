import type { PrismaClient } from "../../src/generated/prisma/client";
import { PREAUTH_FIELDS } from "../../src/features/preauth/domain/preauth-fields";

export async function seedPreauthFields(
  db: PrismaClient,
  params: {
    arjunId: string;
    docsByFileName: Map<string, { id: string; claimId: string; uploadedAt: Date }>;
  },
) {
  const { arjunId, docsByFileName } = params;

  // 1. CLM-3381: All 12 fields confirmed
  const clm3381 = await db.claim.findFirst({ where: { code: "CLM-3381" } });
  const doc3381 = docsByFileName.get("preauth-form-rajendra-pawar.pdf");

  if (clm3381 && doc3381) {
    const fieldValues: Record<string, string> = {
      patientName: "Rajendra Pawar",
      age: "54",
      gender: "MALE",
      policyNumber: clm3381.policyNumber,
      memberId: "MED-2024-88491",
      admissionDate: clm3381.admittedAt.toISOString().slice(0, 10),
      treatingDoctor: clm3381.treatingDoctor,
      chiefComplaints: "Severe right upper quadrant pain radiating to back x 3 days",
      provisionalDiagnosis: "Cholelithiasis with acute cholecystitis",
      proposedTreatment: "Laparoscopic Cholecystectomy",
      expectedStayDays: "2",
      estimatedCost: "85000",
    };

    for (const f of PREAUTH_FIELDS) {
      const val = fieldValues[f.key] ?? "N/A";
      const suggestion = await db.fieldSuggestion.create({
        data: {
          claimId: clm3381.id,
          documentId: doc3381.id,
          fieldKey: f.key,
          value: val,
          sourceSnippet: `${f.label}: ${val}`,
          confidence: 0.96,
        },
      });

      await db.claimField.create({
        data: {
          claimId: clm3381.id,
          fieldKey: f.key,
          value: val,
          suggestionId: suggestion.id,
          confirmedById: arjunId,
          confirmedAt: doc3381.uploadedAt,
        },
      });
    }
  }

  // 2. CLM-3383: 3 confirmed, 6 suggested (with age conflict: 34 vs 33), 3 empty
  const clm3383 = await db.claim.findFirst({ where: { code: "CLM-3383" } });
  const docNotes = docsByFileName.get("obgyn-notes-kavita-nikam.pdf");
  const docAadhaar = docsByFileName.get("aadhaar-kavita-nikam.pdf");

  if (clm3383 && docNotes && docAadhaar) {
    // 3 confirmed fields
    const confirmed: Array<{ key: string; value: string }> = [
      { key: "patientName", value: "Kavita Nikam" },
      { key: "gender", value: "FEMALE" },
      { key: "policyNumber", value: clm3383.policyNumber },
    ];

    for (const c of confirmed) {
      await db.claimField.create({
        data: {
          claimId: clm3383.id,
          fieldKey: c.key,
          value: c.value,
          confirmedById: arjunId,
          confirmedAt: new Date(),
        },
      });
    }

    // 6 suggested fields
    // Conflicting age suggestions: 34 from Aadhaar (0.95), 33 from notes (0.91)
    await db.fieldSuggestion.createMany({
      data: [
        {
          claimId: clm3383.id,
          documentId: docAadhaar.id,
          fieldKey: "age",
          value: "34",
          sourceSnippet: "DOB: 15/06/1992 (Calculated Age 34 yrs)",
          confidence: 0.95,
        },
        {
          claimId: clm3383.id,
          documentId: docNotes.id,
          fieldKey: "age",
          value: "33",
          sourceSnippet: "33 yr female Primi at 38 weeks gestation",
          confidence: 0.91,
        },
        {
          claimId: clm3383.id,
          documentId: docNotes.id,
          fieldKey: "treatingDoctor",
          value: clm3383.treatingDoctor,
          sourceSnippet: `Treating Doctor: ${clm3383.treatingDoctor}`,
          confidence: 0.94,
        },
        {
          claimId: clm3383.id,
          documentId: docNotes.id,
          fieldKey: "chiefComplaints",
          value: "Primi at 38 weeks with reduced fetal movements x 2 days",
          sourceSnippet: "Chief Complaints: Primi at 38 weeks gestation with reduced fetal movements",
          confidence: 0.92,
        },
        {
          claimId: clm3383.id,
          documentId: docNotes.id,
          fieldKey: "provisionalDiagnosis",
          value: "Primi at 38 weeks with severe oligohydramnios and fetal distress",
          sourceSnippet: "Diagnosis: Primi at 38 weeks with severe oligohydramnios (AFI 4 cm)",
          confidence: 0.93,
        },
        {
          claimId: clm3383.id,
          documentId: docNotes.id,
          fieldKey: "proposedTreatment",
          value: "Emergency LSCS (Caesarean Section)",
          sourceSnippet: "Plan: Emergency LSCS indicated in maternal and fetal interest",
          confidence: 0.95,
        },
        {
          claimId: clm3383.id,
          documentId: docNotes.id,
          fieldKey: "expectedStayDays",
          value: "4",
          sourceSnippet: "Expected postoperative indoor stay: 4 days",
          confidence: 0.88,
        },
      ],
    });
  }
}
