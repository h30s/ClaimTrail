"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UploadItem } from "../hooks/use-upload-queue";

export function UploadProgressList({ items, onClearDone }: { items: UploadItem[]; onClearDone: () => void }) {
  if (items.length === 0) return null;

  const hasDoneOrError = items.some((it) => it.status === "done" || it.status === "error");

  return (
    <div className="border-border bg-surface space-y-2 rounded-lg border p-3 text-xs">
      <div className="border-border flex items-center justify-between border-b pb-2">
        <span className="text-muted-foreground font-medium">Upload queue ({items.length})</span>
        {hasDoneOrError && (
          <Button variant="ghost" size="xs" onClick={onClearDone} className="h-6 text-[11px]">
            Clear completed
          </Button>
        )}
      </div>

      <div className="divide-border/40 space-y-2 divide-y">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-1 pt-2 first:pt-0">
            <div className="flex items-center justify-between">
              <span className="text-foreground max-w-[200px] truncate font-medium sm:max-w-xs">
                {item.file.name}
              </span>
              <span className="text-muted-foreground text-[11px]">
                {item.status === "queued" && "Queued..."}
                {item.status === "uploading" && `Uploading ${item.progress}%`}
                {item.status === "reading" && "Reading with AI..."}
                {item.status === "done" && "Filed"}
                {item.status === "error" && "Failed"}
              </span>
            </div>

            {item.status === "uploading" && (
              <div className="bg-secondary h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full transition-all duration-150"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}

            {item.status === "reading" && (
              <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                <Loader2 className="text-primary size-3 animate-spin" />
                <span>Gemini is reading and sorting this document...</span>
              </div>
            )}

            {item.status === "done" && item.result && (
              <div className="text-success flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="size-3" />
                <span>
                  {item.result.status === "SORTED"
                    ? `Filed under ${item.result.documentTypeLabel ?? item.result.documentTypeKey} (${Math.round((item.result.ai.confidence ?? 0) * 100)}%)`
                    : "Sent to tray (needs review)"}
                </span>
              </div>
            )}

            {item.status === "error" && (
              <div className="text-destructive flex items-center gap-1.5 text-[11px]">
                <XCircle className="size-3" />
                <span>{item.error || "Upload failed."}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
