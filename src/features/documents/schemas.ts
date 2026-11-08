import { z } from "zod";

export const MoveDocumentSchema = z.object({
  documentId: z.string().min(1),
  documentTypeKey: z.string().nullable(),
  claimCode: z.string().min(1),
});

export const RemoveDocumentSchema = z.object({
  documentId: z.string().min(1),
  claimCode: z.string().min(1),
});

export const ConfirmIdentitySchema = z.object({
  documentId: z.string().min(1),
  claimCode: z.string().min(1),
});

export const RerunAnalysisSchema = z.object({
  documentId: z.string().min(1),
  claimCode: z.string().min(1),
});
