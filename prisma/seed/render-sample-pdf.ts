import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function renderSamplePdf(input: {
  title: string;
  patientName: string;
  date: string;
  lines: string[];
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
    color: rgb(0.1, 0.2, 0.4),
  });
  page.drawText("Gangapur Road, Nashik - 422013 · Tel: +91 253 2345678", {
    x: 50,
    y: 760,
    size: 9,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Divider
  page.drawLine({
    start: { x: 50, y: 745 },
    end: { x: 545, y: 745 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  // Title
  page.drawText(input.title, {
    x: 50,
    y: 715,
    size: 14,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Patient Info
  page.drawText(`Patient Name: ${input.patientName}`, {
    x: 50,
    y: 690,
    size: 10,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  page.drawText(`Document Date: ${input.date}`, {
    x: 350,
    y: 690,
    size: 10,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Divider
  page.drawLine({
    start: { x: 50, y: 675 },
    end: { x: 545, y: 675 },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.85),
  });

  // Lines
  let y = 650;
  for (const line of input.lines) {
    page.drawText(line, {
      x: 50,
      y,
      size: 10,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    y -= 22;
  }

  // Footer
  page.drawText("Generated for ClaimTrail System · Verified Electronic Medical Record", {
    x: 50,
    y: 40,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return pdfDoc.save();
}
