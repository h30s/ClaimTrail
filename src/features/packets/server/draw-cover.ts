import "server-only";
import { type PDFDocument, type PDFPage, rgb, StandardFonts } from "pdf-lib";
import type { PacketContents } from "./packet-contents";

export type ResolvedPacketDoc = {
  label: string;
  fileName: string;
  startPage: number;
  pageCount: number;
};

export type FailedPacketDoc = {
  label: string;
  fileName: string;
  reason: string;
};

const STAGE_TITLES: Record<string, string> = {
  PRE_AUTH: "Cashless Pre-Auth Request",
  ENHANCEMENT: "Cashless Enhancement Request",
  DISCHARGE: "Cashless Discharge Request",
};

export async function drawCover(
  pdfDoc: PDFDocument,
  page: PDFPage,
  contents: PacketContents,
  resolvedDocs: ResolvedPacketDoc[],
  failedDocs: FailedPacketDoc[],
) {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const black = rgb(0.1, 0.1, 0.1);
  const darkGray = rgb(0.25, 0.25, 0.25);
  const gray = rgb(0.45, 0.45, 0.45);
  const lightRule = rgb(0.8, 0.8, 0.8);

  const age = Math.max(
    0,
    contents.claim.admittedAt.getFullYear() - contents.patient.dateOfBirth.getFullYear(),
  );
  const admDate = contents.claim.admittedAt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const nowIST = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  let y = 790;

  // Hospital Letterhead
  page.drawText("Company A Multispeciality Hospital, Nashik", {
    x: 50,
    y,
    size: 15,
    font: boldFont,
    color: black,
  });
  y -= 16;
  page.drawText("Gangapur Road, Nashik - 422013 · Tel: +91 253 2345678 · Desk: cashless@companya.example", {
    x: 50,
    y,
    size: 8,
    font,
    color: gray,
  });
  y -= 14;
  page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 0.75, color: lightRule });

  // Title
  y -= 24;
  const stageTitle = STAGE_TITLES[contents.stage] ?? "Cashless Claim Request";
  page.drawText(`${stageTitle} · ${contents.payer.name}`, {
    x: 50,
    y,
    size: 13,
    font: boldFont,
    color: black,
  });

  // Metadata Grid
  y -= 22;
  page.drawText(`Claim Ref: ${contents.claim.code}`, { x: 50, y, size: 9, font: boldFont, color: darkGray });
  page.drawText(`Procedure: ${contents.procedure.name}`, { x: 310, y, size: 9, font, color: darkGray });

  y -= 14;
  page.drawText(`Patient: ${contents.patient.name} (${age} ${contents.patient.gender})`, {
    x: 50,
    y,
    size: 9,
    font,
    color: darkGray,
  });
  page.drawText(`Treating Doctor: Dr. ${contents.claim.treatingDoctor}`, {
    x: 310,
    y,
    size: 9,
    font,
    color: darkGray,
  });

  y -= 14;
  page.drawText(`UHID: ${contents.patient.uhid}`, { x: 50, y, size: 9, font, color: darkGray });
  page.drawText(`Admission Date: ${admDate}`, { x: 310, y, size: 9, font, color: darkGray });

  y -= 14;
  page.drawText(`Policy No: ${contents.claim.policyNumber}`, { x: 50, y, size: 9, font, color: darkGray });
  const estFormatted = contents.claim.estimatedAmount.toLocaleString("en-IN");
  page.drawText(`Estimated Amount: Rs. ${estFormatted}`, {
    x: 310,
    y,
    size: 9,
    font: boldFont,
    color: darkGray,
  });

  y -= 16;
  page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 0.5, color: lightRule });

  // Table of Contents
  y -= 20;
  page.drawText("TABLE OF CONTENTS", { x: 50, y, size: 10, font: boldFont, color: black });
  page.drawText("PAGE", { x: 510, y, size: 9, font: boldFont, color: gray });

  y -= 14;
  if (resolvedDocs.length === 0) {
    page.drawText("(No documents attached)", { x: 50, y, size: 9, font, color: gray });
    y -= 14;
  } else {
    for (const doc of resolvedDocs) {
      page.drawText(doc.label, { x: 50, y, size: 9, font, color: darkGray });
      page.drawText(String(doc.startPage), { x: 520, y, size: 9, font: boldFont, color: darkGray });
      y -= 14;
    }
  }

  for (const failed of failedDocs) {
    page.drawText(`Could not include: ${failed.fileName} (open and attach separately)`, {
      x: 50,
      y,
      size: 8,
      font,
      color: rgb(0.7, 0.2, 0.2),
    });
    y -= 13;
  }

  // Pre-auth Confirmed Fields (if PRE_AUTH)
  if (contents.stage === "PRE_AUTH" && contents.confirmedFields.length > 0) {
    y -= 10;
    page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 0.5, color: lightRule });
    y -= 18;
    page.drawText("CONFIRMED PRE-AUTH FIELDS", { x: 50, y, size: 10, font: boldFont, color: black });
    y -= 14;

    const mid = Math.ceil(contents.confirmedFields.length / 2);
    const leftCol = contents.confirmedFields.slice(0, mid);
    const rightCol = contents.confirmedFields.slice(mid);
    const startY = y;

    for (let i = 0; i < leftCol.length; i++) {
      const field = leftCol[i]!;
      page.drawText(`${field.label}: `, {
        x: 50,
        y: startY - i * 14,
        size: 8,
        font: boldFont,
        color: darkGray,
      });
      const labelWidth = boldFont.widthOfTextAtSize(`${field.label}: `, 8);
      page.drawText(field.value, { x: 50 + labelWidth, y: startY - i * 14, size: 8, font, color: darkGray });
    }

    for (let i = 0; i < rightCol.length; i++) {
      const field = rightCol[i]!;
      page.drawText(`${field.label}: `, {
        x: 310,
        y: startY - i * 14,
        size: 8,
        font: boldFont,
        color: darkGray,
      });
      const labelWidth = boldFont.widthOfTextAtSize(`${field.label}: `, 8);
      page.drawText(field.value, { x: 310 + labelWidth, y: startY - i * 14, size: 8, font, color: darkGray });
    }

    y = startY - Math.max(leftCol.length, rightCol.length) * 14;
  }

  // Bottom Footnote
  page.drawLine({ start: { x: 50, y: 50 }, end: { x: 545, y: 50 }, thickness: 0.5, color: lightRule });
  page.drawText(`Prepared by ${contents.user.name}, ${nowIST} IST · ClaimTrail Cashless Management`, {
    x: 50,
    y: 36,
    size: 7.5,
    font,
    color: gray,
  });
}
