import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function renderDocumentPdf(input: {
  fileName: string;
  claimCode: string;
  patientName: string;
  documentTypeLabel?: string | null;
  uploadedAt: Date;
}): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Hospital Letterhead
  page.drawText("Company A Multispeciality Hospital", {
    x: 50,
    y: 780,
    size: 16,
    font: boldFont,
    color: rgb(0.06, 0.46, 0.43),
  });
  page.drawText("Gangapur Road, Nashik - 422013 · Tel: +91 253 2345678", {
    x: 50,
    y: 760,
    size: 9,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawLine({
    start: { x: 50, y: 745 },
    end: { x: 545, y: 745 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  // Title
  page.drawText(input.documentTypeLabel || input.fileName, {
    x: 50,
    y: 715,
    size: 14,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Patient Info & Claim
  page.drawText(`Patient Name: ${input.patientName}`, {
    x: 50,
    y: 690,
    size: 10,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  page.drawText(`Claim Ref: ${input.claimCode}`, {
    x: 350,
    y: 690,
    size: 10,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText(`Document File: ${input.fileName}`, {
    x: 50,
    y: 670,
    size: 9,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(`Date: ${input.uploadedAt.toISOString().slice(0, 10)}`, {
    x: 350,
    y: 670,
    size: 9,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawLine({
    start: { x: 50, y: 655 },
    end: { x: 545, y: 655 },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.85),
  });

  const lines = [
    "Clinical Documentation & Investigation Record",
    "Verified and archived for cashless hospitalization claim adjudication.",
    "Patient identity verified against hospital admission record.",
    "This diagnostic report forms part of the verified insurance claim docket.",
  ];

  let y = 620;
  for (const line of lines) {
    page.drawText(line, { x: 50, y, size: 10, font, color: rgb(0.25, 0.25, 0.25) });
    y -= 20;
  }

  // Footer seal
  page.drawText("Authorized Hospital Medical Records Department", {
    x: 50,
    y: 100,
    size: 9,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText("Company A Multispeciality Hospital · Nashik", {
    x: 50,
    y: 85,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return pdfDoc.save();
}
