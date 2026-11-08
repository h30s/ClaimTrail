import "dotenv/config";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { SEED_DOCUMENT_TYPES } from "../prisma/seed/data/document-types";
import { geminiProvider } from "../src/features/ai/gemini/gemini-provider";
import type { DocumentTypeHint } from "../src/features/ai/provider";

type ManifestItem = {
  file: string;
  expectedType: string;
  expectedPatient: string;
  expectedFields?: Record<string, string>;
};

async function runEval() {
  const sampleDir = path.resolve(process.cwd(), "sample-uploads");
  const manifestPath = path.join(sampleDir, "manifest.json");

  const rawManifest = await fs.readFile(manifestPath, "utf8");
  const manifest: ManifestItem[] = JSON.parse(rawManifest);

  const documentTypes: DocumentTypeHint[] = SEED_DOCUMENT_TYPES.map((d) => ({
    key: d.key,
    label: d.label,
    description: d.description,
  }));

  console.log(`Starting AI Document Analysis Evaluation on ${manifest.length} samples...\n`);
  console.log(`Model: ${process.env.GEMINI_MODEL || "gemini-2.5-flash"}\n`);

  const results: Array<{
    file: string;
    expectedType: string;
    detectedType: string;
    confidence: number;
    typeMatch: boolean;
    patientMatch: boolean;
    latencyMs: number;
    status: string;
  }> = [];

  for (const item of manifest) {
    const filePath = path.join(sampleDir, item.file);
    const bytes = await fs.readFile(filePath);

    const res = await geminiProvider.analyseDocument({
      bytes,
      mimeType: "application/pdf",
      fileName: item.file,
      documentTypes,
    });

    if (!res.ok) {
      console.log(`❌ ${item.file} -> FAILED: ${res.message}`);
      results.push({
        file: item.file,
        expectedType: item.expectedType,
        detectedType: "FAILED",
        confidence: 0,
        typeMatch: false,
        patientMatch: false,
        latencyMs: res.meta.latencyMs,
        status: res.reason,
      });
      continue;
    }

    const data = res.data;
    const typeMatch = data.documentType === item.expectedType;
    const patientMatch =
      item.expectedPatient.toLowerCase().includes(data.patientName?.toLowerCase() ?? "") ||
      (data.patientName?.toLowerCase().includes(item.expectedPatient.toLowerCase()) ?? false);

    results.push({
      file: item.file,
      expectedType: item.expectedType,
      detectedType: data.documentType,
      confidence: data.confidence,
      typeMatch,
      patientMatch,
      latencyMs: res.meta.latencyMs,
      status: "OK",
    });

    const icon = typeMatch ? "✓" : "❌";
    console.log(
      `${icon} ${item.file.padEnd(35)} | Expected: ${item.expectedType.padEnd(18)} | Detected: ${data.documentType.padEnd(18)} | Conf: ${(data.confidence * 100).toFixed(0)}% | Latency: ${res.meta.latencyMs}ms`,
    );

    // Pace requests to respect free-tier RPM
    await new Promise((r) => setTimeout(r, 12000));
  }

  const total = results.length;
  const correctType = results.filter((r) => r.typeMatch).length;
  const typeAccuracy = Math.round((correctType / total) * 100);
  const autoFiled = results.filter((r) => r.confidence >= 0.8 && r.detectedType !== "UNKNOWN");
  const autoFiledCorrect = autoFiled.filter((r) => r.typeMatch).length;
  const autoFiledAccuracy =
    autoFiled.length > 0 ? Math.round((autoFiledCorrect / autoFiled.length) * 100) : 100;
  const reviewCount = results.filter(
    (r) => r.confidence < 0.8 || r.detectedType === "UNKNOWN" || r.status !== "OK",
  ).length;
  const reviewRate = Math.round((reviewCount / total) * 100);

  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  const meanLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / total);
  const p95Latency = latencies[Math.floor(total * 0.95)] ?? meanLatency;

  console.log("\n========================================================");
  console.log("                  EVALUATION SUMMARY                    ");
  console.log("========================================================");
  console.log(`Total Samples Evaluated:      ${total}`);
  console.log(`Document Type Accuracy:       ${typeAccuracy}% (${correctType}/${total})`);
  console.log(
    `Auto-filed Accuracy (>=80%):  ${autoFiledAccuracy}% (${autoFiledCorrect}/${autoFiled.length})`,
  );
  console.log(`Review Tray Rate:             ${reviewRate}% (${reviewCount}/${total})`);
  console.log(`Mean Latency:                 ${meanLatency} ms`);
  console.log(`P95 Latency:                  ${p95Latency} ms`);
  console.log("========================================================\n");

  const outDir = path.resolve(process.cwd(), "eval-results");
  await fs.mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, `${Date.now()}-gemini-eval.json`);
  await fs.writeFile(
    outFile,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        summary: {
          total,
          typeAccuracy,
          autoFiledAccuracy,
          reviewRate,
          meanLatency,
          p95Latency,
        },
        results,
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log(`Saved evaluation report to ${outFile}`);
}

runEval().catch((err) => {
  console.error("Evaluation script failed:", err);
  process.exit(1);
});
