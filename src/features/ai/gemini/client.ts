import "server-only";
import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";

export const geminiClient = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
  apiVersion: "v1beta",
});
