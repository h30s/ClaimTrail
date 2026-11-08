import "server-only";
import { geminiProvider } from "./gemini/gemini-provider";
import type { AiProvider } from "./provider";

export async function getAiProvider(): Promise<AiProvider> {
  return geminiProvider;
}
