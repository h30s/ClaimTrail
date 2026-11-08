"use client";

import { useTransition } from "react";
import { AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { DocumentDto } from "../types";
import { rerunAnalysis, removeDocument, moveDocument } from "../server/actions";
import { MoveToMenu } from "./move-to-menu";
import { DocumentChip } from "./document-chip";

export function TrayItem({
  doc,
  claimCode,
  documentTypes,
  onPreview,
  onMoveOptimistic,
}: {
  doc: DocumentDto;
  claimCode: string;
  documentTypes: Array<{ key: string; label: string }>;
  onPreview: (doc: DocumentDto) => void;
  onMoveOptimistic?: (targetKey: string | null) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleRerun = () => {
    startTransition(async () => {
      const res = await rerunAnalysis({ documentId: doc.id, claimCode });
      if (!res.ok) {
        toast.error(res.error || "Re-run failed.");
      } else {
        toast.success("AI analysis completed.");
      }
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      const res = await removeDocument({ documentId: doc.id, claimCode });
      if (!res.ok) {
        toast.error(res.error || "Could not remove document.");
      } else {
        toast.success("Document removed.");
      }
    });
  };

  const handleQuickMove = (typeKey: string) => {
    onMoveOptimistic?.(typeKey);
    startTransition(async () => {
      const res = await moveDocument({
        documentId: doc.id,
        documentTypeKey: typeKey,
        claimCode,
      });
      if (!res.ok) toast.error(res.error || "Move failed.");
    });
  };

  return (
    <div className="border-border bg-surface flex flex-col gap-2 rounded-lg border p-3 text-xs">
      <DocumentChip
        doc={doc}
        claimCode={claimCode}
        documentTypes={documentTypes}
        onPreview={onPreview}
        onMoveOptimistic={onMoveOptimistic}
      />

      {doc.ai.reason && (
        <div className="text-muted-foreground flex items-center gap-1.5 px-1 text-[11px]">
          <AlertCircle className="text-warning size-3.5 shrink-0" />
          <span>{doc.ai.reason}</span>
        </div>
      )}

      <div className="border-border/50 flex flex-wrap items-center justify-between gap-2 border-t pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {doc.ai.alternatives && doc.ai.alternatives.length > 0 && (
            <>
              <span className="text-muted-foreground text-[10px]">Suggestions:</span>
              {doc.ai.alternatives.map((alt) => {
                const label =
                  documentTypes.find((t) => t.key === alt.documentType)?.label ?? alt.documentType;
                return (
                  <Button
                    key={alt.documentType}
                    variant="outline"
                    size="xs"
                    disabled={isPending}
                    onClick={() => handleQuickMove(alt.documentType)}
                    className="h-6 text-[10px]"
                  >
                    {label} ({Math.round(alt.confidence * 100)}%)
                  </Button>
                );
              })}
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {doc.ai.failed && (
            <Button
              variant="outline"
              size="xs"
              disabled={isPending}
              onClick={handleRerun}
              className="h-6 gap-1 text-[10px]"
            >
              <RefreshCw className="size-3" />
              Re-run AI
            </Button>
          )}

          <MoveToMenu
            documentId={doc.id}
            claimCode={claimCode}
            documentTypes={documentTypes}
            currentTypeKey={doc.documentTypeKey}
            onMoveOptimistic={onMoveOptimistic}
          />

          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            onClick={handleRemove}
            className="text-muted-foreground hover:text-destructive size-6"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
