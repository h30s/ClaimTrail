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

export const geminiProvider: AiProvider = {
  async analyseDocument(input: AnalyseDocumentInput): Promise<AiResult<DocumentAnalysis>> {
    const start = Date.now();
    const promptVersion = DOCUMENT_PROMPT_VERSION;
    const model = env.GEMINI_MODEL;
    const keys = toKeyTuple(input.documentTypes);
    const schema = documentAnalysisSchema(keys);
    const system = documentAnalysisSystemPrompt(input.documentTypes);

    const meta = (usage?: { prompt?: number; output?: number }): AiMeta => ({
      model,
      promptVersion,
      latencyMs: Date.now() - start,
      inputTokens: usage?.prompt,
      outputTokens: usage?.output,
    });

    try {
      const base64Data = Buffer.from(input.bytes).toString("base64");
      const response = await geminiClient.models.generateContent({
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
      });

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
          meta: meta(usage),
        };
      }

      const text = response.text;
      if (!text) {
        return {
          ok: false,
          reason: "INVALID_OUTPUT",
          message: "Empty response from Gemini.",
          meta: meta(usage),
        };
      }

      const raw = JSON.parse(text);
      const checked = schema.safeParse(raw);
      if (!checked.success) {
        return {
          ok: false,
          reason: "INVALID_OUTPUT",
          message: checked.error.message,
          meta: meta(usage),
        };
      }

      return { ok: true, data: checked.data, meta: meta(usage) };
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI request failed";
      return { ok: false, reason: "ERROR", message, meta: meta() };
    }
  },

  async summariseQuery(input: SummariseQueryInput): Promise<AiResult<QuerySummary>> {
    const start = Date.now();
    const promptVersion = QUERY_PROMPT_VERSION;
    const model = env.GEMINI_MODEL;
    const keys = toKeyTuple(input.documentTypes);
    const schema = querySummarySchema(keys);
    const system = querySummarySystemPrompt(input.documentTypes);

    const meta = (usage?: { prompt?: number; output?: number }): AiMeta => ({
      model,
      promptVersion,
      latencyMs: Date.now() - start,
      inputTokens: usage?.prompt,
      outputTokens: usage?.output,
    });

    try {
      const response = await geminiClient.models.generateContent({
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
      });

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
          meta: meta(usage),
        };
      }

      const text = response.text;
      if (!text) {
        return {
          ok: false,
          reason: "INVALID_OUTPUT",
          message: "Empty response from Gemini.",
          meta: meta(usage),
        };
      }

      const raw = JSON.parse(text);
      const checked = schema.safeParse(raw);
      if (!checked.success) {
        return {
          ok: false,
          reason: "INVALID_OUTPUT",
          message: checked.error.message,
          meta: meta(usage),
        };
      }

      return { ok: true, data: checked.data, meta: meta(usage) };
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI query request failed";
      return { ok: false, reason: "ERROR", message, meta: meta() };
    }
  },
};
