import type { Prisma } from "@/generated/prisma/client";
import type { AiTask } from "@/lib/enums";
import type { AiResult } from "../provider";

// Logs every model call, success or not. This table is how we measure accuracy, latency and cost.
export function recordAiRun(
  writer: Pick<Prisma.TransactionClient, "aiRun">,
  args: {
    task: AiTask;
    result: AiResult<unknown>;
    documentId?: string;
    queryId?: string;
  },
) {
  const { meta } = args.result;
  return writer.aiRun.create({
    data: {
      task: args.task,
      model: meta.model,
      promptVersion: meta.promptVersion,
      latencyMs: meta.latencyMs,
      inputTokens: meta.inputTokens,
      outputTokens: meta.outputTokens,
      status: args.result.ok ? "OK" : args.result.reason,
      error: args.result.ok ? null : args.result.message.slice(0, 500),
      output: args.result.ok ? (args.result.data as Prisma.InputJsonValue) : undefined,
      documentId: args.documentId,
      queryId: args.queryId,
    },
  });
}
