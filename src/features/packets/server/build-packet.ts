import "server-only";
import { PDFDocument } from "pdf-lib";
import { storage } from "@/lib/storage";
import type { PacketContents } from "./packet-contents";
import { drawCover, type FailedPacketDoc, type ResolvedPacketDoc } from "./draw-cover";

export async function buildPacket(contents: PacketContents): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const coverPage = pdfDoc.addPage([595.28, 841.89]);

  const resolvedDocs: ResolvedPacketDoc[] = [];
  const failedDocs: FailedPacketDoc[] = [];

  for (const doc of contents.documents) {
    if (doc.mimeType === "application/pdf") {
      try {
        const bytes = await storage.get(doc.storageKey);
        const srcPdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const indices = srcPdf.getPageIndices();
        const copied = await pdfDoc.copyPages(srcPdf, indices);
        const startPage = pdfDoc.getPageCount() + 1;
        for (const page of copied) {
          pdfDoc.addPage(page);
        }
        resolvedDocs.push({
          label: doc.label,
          fileName: doc.fileName,
          startPage,
          pageCount: indices.length,
        });
      } catch {
        failedDocs.push({
          label: doc.label,
          fileName: doc.fileName,
          reason: "corrupted or encrypted",
        });
      }
    } else if (doc.mimeType.startsWith("image/")) {
      try {
        const bytes = await storage.get(doc.storageKey);
        const isPng = doc.mimeType.toLowerCase().includes("png");
        const embedded = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
        const imgPage = pdfDoc.addPage([595.28, 841.89]);
        const margin = 36;
        const maxW = 595.28 - margin * 2;
        const maxH = 841.89 - margin * 2;
        const dims = embedded.scaleToFit(maxW, maxH);
        const x = margin + (maxW - dims.width) / 2;
        const y = margin + (maxH - dims.height) / 2;
        imgPage.drawImage(embedded, { x, y, width: dims.width, height: dims.height });
        resolvedDocs.push({
          label: doc.label,
          fileName: doc.fileName,
          startPage: pdfDoc.getPageCount(),
          pageCount: 1,
        });
      } catch {
        failedDocs.push({
          label: doc.label,
          fileName: doc.fileName,
          reason: "unable to embed image",
        });
      }
    }
  }

  await drawCover(pdfDoc, coverPage, contents, resolvedDocs, failedDocs);

  return await pdfDoc.save();
}
