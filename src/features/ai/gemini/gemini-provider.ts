import "server-only";
import { env } from "@/lib/env";
import { geminiClient } from "./client";
import {
  documentAnalysisSchema,
  querySummarySchema,
  type DocumentAnalysis,
  type QuerySummary,
} from "../schemas";
import { DOCUMENT_PROMPT_VERSION, documentAnalysisSystemPrompt } from "../prompts/document-analysis";
import { QUERY_PROMPT_VERSION, querySummarySystemPrompt } from "../prompts/query-summary";
import type {
  AiMeta,
  AiProvider,
  AiResult,
  AnalyseDocumentInput,
  DocumentTypeHint,
  SummariseQueryInput,
} from "../provider";

function toKeyTuple(types: DocumentTypeHint[]): [string, ...string[]] {
  const keys = types.map((t) => t.key);
  if (keys.length === 0) return ["UNKNOWN"];
  return [keys[0]!, ...keys.slice(1)];
}

const FALLBACK_MODELS = [
  env.GEMINI_MODEL,
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
];

async function generateWithFallback<T>(
  call: (model: string) => Promise<T>,
): Promise<{ result: T; usedModel: string }> {
  const models = Array.from(new Set(FALLBACK_MODELS));
  let lastErr: unknown;

  for (const model of models) {
    try {
      const res = await call(model);
      return { result: res, usedModel: model };
    } catch (err: unknown) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isQuotaOrNotFound =
        msg.includes("429") ||
        msg.includes("RESOURCE_EXHAUSTED") ||
        msg.includes("404") ||
        msg.includes("NOT_FOUND");
      if (isQuotaOrNotFound) {
        continue;
      }
      throw err;
    }
  }
  throw lastErr ?? new Error("All Gemini models exhausted");
}

export const geminiProvider: AiProvider = {
  async analyseDocument(input: AnalyseDocumentInput): Promise<AiResult<DocumentAnalysis>> {
    const start = Date.now();
    const promptVersion = DOCUMENT_PROMPT_VERSION;
    const keys = toKeyTuple(input.documentTypes);
    const schema = documentAnalysisSchema(keys);
    const system = documentAnalysisSystemPrompt(input.documentTypes);

    const makeMeta = (model: string, usage?: { prompt?: number; output?: number }): AiMeta => ({
      model,
      promptVersion,
      latencyMs: Date.now() - start,
      inputTokens: usage?.prompt,
      outputTokens: usage?.output,
    });

    try {
      const base64Data = Buffer.from(input.bytes).toString("base64");
      const { result: response, usedModel } = await generateWithFallback((model) =>
        geminiClient.models.generateContent({
          model,
          contents: [
            {
              inlineData: {
                mimeType: input.mimeType,
                data: base64Data,
              },
            },
            {
              text: `File name: ${input.fileName}\nAnalyze this document and output JSON adhering to the specified schema.`,
            },
          ],
          config: {
            systemInstruction: system,
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        }),
      );

      const usage = {
        prompt: response.usageMetadata?.promptTokenCount,
        output: response.usageMetadata?.candidatesTokenCount,
      };

      const candidate = response.candidates?.[0];
      if (candidate?.finishReason === "SAFETY" || candidate?.finishReason === "BLOCKLIST") {
        return {
          ok: false,
          reason: "REFUSED",
          message: "Document was declined by safety filters.",
          meta: makeMeta(usedModel, usage),
        };
      }

      const text = response.text;
      if (!text) {
        return {
          ok: false,
          reason: "INVALID_OUTPUT",
          message: "Empty response from Gemini.",
          meta: makeMeta(usedModel, usage),
        };
      }

      const raw = JSON.parse(text);
      const checked = schema.safeParse(raw);
      if (!checked.success) {
        return {
          ok: false,
          reason: "INVALID_OUTPUT",
          message: checked.error.message,
          meta: makeMeta(usedModel, usage),
        };
      }

      return { ok: true, data: checked.data, meta: makeMeta(usedModel, usage) };
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI request failed";
      return { ok: false, reason: "ERROR", message, meta: makeMeta(env.GEMINI_MODEL) };
    }
  },

  async summariseQuery(input: SummariseQueryInput): Promise<AiResult<QuerySummary>> {
    const start = Date.now();
    const promptVersion = QUERY_PROMPT_VERSION;
    const keys = toKeyTuple(input.documentTypes);
    const schema = querySummarySchema(keys);
    const system = querySummarySystemPrompt(input.documentTypes);

    const makeMeta = (model: string, usage?: { prompt?: number; output?: number }): AiMeta => ({
      model,
      promptVersion,
      latencyMs: Date.now() - start,
      inputTokens: usage?.prompt,
      outputTokens: usage?.output,
    });

    try {
      const { result: response, usedModel } = await generateWithFallback((model) =>
        geminiClient.models.generateContent({
          model,
          contents: [
            {
              text: `Subject: ${input.subject}\nReceived: ${input.receivedAt.toISOString()}\n\nBody:\n${input.body}`,
            },
          ],
          config: {
            systemInstruction: system,
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        }),
      );

      const usage = {
        prompt: response.usageMetadata?.promptTokenCount,
        output: response.usageMetadata?.candidatesTokenCount,
      };

      const candidate = response.candidates?.[0];
      if (candidate?.finishReason === "SAFETY" || candidate?.finishReason === "BLOCKLIST") {
        return {
          ok: false,
          reason: "REFUSED",
          message: "Query email was declined by safety filters.",
          meta: makeMeta(usedModel, usage),
        };
      }

      const text = response.text;
      if (!text) {
        return {
          ok: false,
          reason: "INVALID_OUTPUT",
          message: "Empty response from Gemini.",
          meta: makeMeta(usedModel, usage),
        };
      }

      const raw = JSON.parse(text);
      const checked = schema.safeParse(raw);
      if (!checked.success) {
        return {
          ok: false,
          reason: "INVALID_OUTPUT",
          message: checked.error.message,
          meta: makeMeta(usedModel, usage),
        };
      }

      return { ok: true, data: checked.data, meta: makeMeta(usedModel, usage) };
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI query request failed";
      return { ok: false, reason: "ERROR", message, meta: makeMeta(env.GEMINI_MODEL) };
    }
  },
};
