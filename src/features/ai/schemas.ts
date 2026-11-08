import { z } from "zod";
import { PREAUTH_FIELD_KEYS } from "@/features/preauth/domain/preauth-fields";

const confidence = z.number().min(0).max(1);

export function documentAnalysisSchema(typeKeys: [string, ...string[]]) {
  const typeEnum = z.enum([...typeKeys, "UNKNOWN"]);

  return z.object({
    documentType: typeEnum,
    confidence,
    alternatives: z
      .array(
        z.object({
          documentType: typeEnum,
          confidence,
        }),
      )
      .max(2)
      .default([]),
    reason: z.string().max(500).nullable().default(null),
    isLegible: z.boolean(),
    patientName: z.string().nullable(),
    documentDate: z.string().nullable(),
    fields: z
      .array(
        z.object({
          key: z.enum(PREAUTH_FIELD_KEYS),
          value: z.string(),
          sourceSnippet: z.string(),
          confidence,
        }),
      )
      .default([]),
  });
}

export type DocumentAnalysis = z.infer<ReturnType<typeof documentAnalysisSchema>>;

export function querySummarySchema(typeKeys: [string, ...string[]]) {
  const askDocTypeEnum = z.enum([...typeKeys, "UNKNOWN"]).nullable();

  return z.object({
    summary: z.string().max(300),
    asks: z
      .array(
        z.object({
          position: z.number().int().min(1).optional(),
          text: z.string(),
          documentType: askDocTypeEnum.default(null),
          sourceSnippet: z.string().nullable().default(null),
        }),
      )
      .default([]),
    claimReference: z.string().nullable(),
    patientName: z.string().nullable(),
    deadline: z
      .object({
        iso: z.string().nullable().default(null),
        sourceSnippet: z.string().nullable().default(null),
      })
      .nullable()
      .default(null),
  });
}

export type QuerySummary = z.infer<ReturnType<typeof querySummarySchema>>;
