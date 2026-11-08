import "dotenv/config";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { renderSamplePdf } from "../prisma/seed/render-sample-pdf";

const SAMPLE_DIR = path.resolve(process.cwd(), "sample-uploads");

const SAMPLES = [
  {
    file: "usg-abdomen-rajendra-pawar.pdf",
    expectedType: "ULTRASOUND_REPORT",
    expectedPatient: "Rajendra Pawar",
    expectedFields: {
      provisionalDiagnosis: "Cholelithiasis with acute cholecystitis",
    },
    title: "Ultrasound Abdomen & Pelvis Sonography Report",
    patientName: "Rajendra Pawar",
    date: "2026-11-08",
    lines: [
      "Department of Radio-Diagnosis & Imaging",
      "Clinical Indication: Severe right hypochondrial pain and fever",
      "Liver: Normal in size and parenchymal echotexture. No focal lesion.",
      "Gall Bladder: Distended, contains multiple mobile calculi. Largest stone 14 mm.",
      "GB wall thickened (4.5 mm) with pericholecystic fluid, positive sonographic Murphy.",
      "Common Bile Duct: 4.2 mm, within normal limits. No choledocholithiasis.",
      "Pancreas and Spleen: Normal echotexture.",
      "Impression: Cholelithiasis with features of acute calculous cholecystitis.",
    ],
  },
  {
    file: "cbc-latest-imran-shaikh.pdf",
    expectedType: "CBC_REPORT",
    expectedPatient: "Imran Shaikh",
    expectedFields: {},
    title: "Pathology Laboratory Report - Complete Blood Count",
    patientName: "Imran Shaikh",
    date: "2026-11-08",
    lines: [
      "Clinical History: Dengue Fever Day 4 with thrombocytopenia",
      "Haemoglobin: 13.6 g/dL (Normal: 13.0 - 17.0)",
      "Total Leucocyte Count (TLC): 2,900 /mcL (Leukopenia)",
      "Platelet Count: 32,000 /mcL (CRITICAL LOW: Normal 1,50,000 - 4,50,000)",
      "Hematocrit (PCV): 44.5% (Hemoconcentration)",
      "Impression: Significant thrombocytopenia; close platelet monitoring advised.",
    ],
  },
  {
    file: "final-bill-ganesh-thakare.pdf",
    expectedType: "FINAL_BILL",
    expectedPatient: "Ganesh Thakare",
    expectedFields: {
      estimatedCost: "38000",
    },
    title: "Final Inpatient Tax Invoice & Detailed Hospital Bill",
    patientName: "Ganesh Thakare",
    date: "2026-11-08",
    lines: [
      "IPD Bill Number: IPD-2026-44029 | Admission Date: 07/11/2026",
      "Procedure: Left Eye Phacoemulsification with Foldable Hydrophobic IOL",
      "Operation Theatre & Anaesthesia Charges: Rs. 16,000",
      "Foldable Intraocular Lens (IOL): Rs. 12,000",
      "Surgeon Consultation and Procedure Fee: Rs. 7,000",
      "Medicines, Viscoelastics and Consumables: Rs. 3,000",
      "Net Payable Amount: Rs. 38,000",
    ],
  },
  {
    file: "discharge-summary-lata-sonawane.pdf",
    expectedType: "DISCHARGE_SUMMARY",
    expectedPatient: "Lata Sonawane",
    expectedFields: {},
    title: "Hospital Discharge Summary & Case Synopsis",
    patientName: "Lata Sonawane",
    date: "2026-11-06",
    lines: [
      "Date of Admission: 02/11/2026 | Date of Discharge: 06/11/2026",
      "Final Diagnosis: Severe Primary Osteoarthritis - Left Knee",
      "Surgical Procedure Performed: Left Total Knee Arthroplasty (TKR)",
      "Course in Hospital: Uncomplicated post-operative recovery, mobilized with walker",
      "Condition at Discharge: Stable, afebrile, surgical incision dry and healing well",
      "Advice on Discharge: Tablet Cefuroxime 500mg BD x 5 days, Physical therapy twice daily",
    ],
  },
  {
    file: "xray-chest-anil-jadhav.pdf",
    expectedType: "XRAY_REPORT",
    expectedPatient: "Anil Jadhav",
    expectedFields: {},
    title: "Digital Radiography - Chest PA View",
    patientName: "Anil Jadhav",
    date: "2026-11-08",
    lines: [
      "Clinical Indication: High fever, productive cough, right pleuritic chest pain",
      "Technique: High-resolution digital radiograph PA view in full inspiration",
      "Findings: Non-homogeneous patchy consolidation in right lower zone with air bronchogram",
      "Right and left hemidiaphragms and costophrenic angles are well visualised",
      "Cardiac size and pulmonary vascularity within normal limits",
      "Impression: Features consistent with right lower lobe acute community-acquired pneumonia.",
    ],
  },
  {
    file: "preauth-form-kavita-nikam.pdf",
    expectedType: "PREAUTH_FORM",
    expectedPatient: "Kavita Nikam",
    expectedFields: {
      patientName: "Kavita Nikam",
      age: "34",
      gender: "FEMALE",
      estimatedCost: "70000",
    },
    title: "Cashless Pre-Authorization Request Form",
    patientName: "Kavita Nikam",
    date: "2026-11-08",
    lines: [
      "Hospital: Company A Multispeciality Hospital, Nashik",
      "Patient Name: Kavita Nikam | Age: 34 Years | Gender: Female",
      "Admission Date: 2026-11-08 | Treating Doctor: Dr. Rekha Wani",
      "Provisional Diagnosis: Full-term pregnancy with severe oligohydramnios and fetal distress",
      "Proposed Procedure: Emergency Lower Segment Caesarean Section (LSCS)",
      "Estimated Length of Stay: 3 Days",
      "Total Estimated Hospital Cost: Rs. 70,000",
    ],
  },
  {
    file: "restaurant-food-bill.pdf",
    expectedType: "UNKNOWN",
    expectedPatient: "Walk-in Guest",
    expectedFields: {},
    title: "Hotel Panchavati Yatri - Restaurant Food Invoice",
    patientName: "Walk-in Guest",
    date: "2026-11-07",
    lines: [
      "Table No: 14 | Steward: Ramesh | Invoice No: F-9921",
      "2x Special Maharashtrian Thali: Rs. 500",
      "1x Masala Buttermilk: Rs. 50",
      "1x Packaged Drinking Water 1L: Rs. 20",
      "CGST (2.5%): Rs. 14.25 | SGST (2.5%): Rs. 14.25",
      "Total Amount Paid: Rs. 598.50 via UPI",
      "Thank you for dining with us! Please visit again.",
    ],
  },
];

async function main() {
  await fs.mkdir(SAMPLE_DIR, { recursive: true });

  const manifest = [];

  for (const s of SAMPLES) {
    const bytes = await renderSamplePdf({
      title: s.title,
      patientName: s.patientName,
      date: s.date,
      lines: s.lines,
    });

    const filePath = path.join(SAMPLE_DIR, s.file);
    await fs.writeFile(filePath, bytes);
    console.log(`✓ Generated sample file: ${s.file} (${bytes.byteLength} bytes)`);

    manifest.push({
      file: s.file,
      expectedType: s.expectedType,
      expectedPatient: s.expectedPatient,
      expectedFields: s.expectedFields,
    });
  }

  const manifestPath = path.join(SAMPLE_DIR, "manifest.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`✓ Generated sample manifest at ${manifestPath}`);
}

main().catch((err) => {
  console.error("Failed to generate sample uploads:", err);
  process.exit(1);
});
