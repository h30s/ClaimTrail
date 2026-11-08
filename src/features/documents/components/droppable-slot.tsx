"use client";

import { useDroppable } from "@dnd-kit/core";
import { AlertCircle, AlertTriangle, CheckCircle2, Circle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Slot } from "@/features/checklist/domain/compute-gaps";
import { SCOPE_LABEL } from "@/features/checklist/domain/labels";
import { RequirementChip } from "@/features/checklist/components/requirement-chip";
import type { DocumentDto } from "../types";
import { DocumentChip } from "./document-chip";

export function DroppableSlot({
  slot,
  label,
  typeKey,
  documents,
  claimCode,
  documentTypes,
  onPreview,
  onMoveOptimistic,
  onTriggerUpload,
}: {
  slot: Slot;
  label: string;
  typeKey: string;
  documents: DocumentDto[];
  claimCode: string;
  documentTypes: Array<{ key: string; label: string }>;
  onPreview: (doc: DocumentDto) => void;
  onMoveOptimistic?: (targetKey: string | null) => void;
  onTriggerUpload?: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: typeKey,
  });

  const isReq = slot.item.requirement === "REQUIRED";

  return (
    <div
      ref={setNodeRef}
      className={`border-border bg-surface flex flex-col gap-2 rounded-lg border p-3 transition-colors ${
        isOver ? "border-primary bg-primary/5 ring-primary/20 ring-2" : ""
      }`}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          {slot.state === "SATISFIED" && <CheckCircle2 className="text-success size-4 shrink-0" />}
          {slot.state === "NEEDS_CHECK" && <AlertTriangle className="text-danger size-4 shrink-0" />}
          {slot.state === "STALE" && <AlertCircle className="text-warning size-4 shrink-0" />}
          {slot.state === "MISSING" &&
            (isReq ? (
              <Circle className="text-danger size-4 shrink-0" />
            ) : (
              <Circle className="text-muted-foreground size-4 shrink-0" />
            ))}

          <span className="text-foreground truncate text-xs font-medium">{label}</span>
          <RequirementChip requirement={slot.item.requirement} needsFreshCopy={slot.item.needsFreshCopy} />
          <span className="text-muted-foreground/80 hidden font-mono text-[10px] sm:inline">
            ⓘ {SCOPE_LABEL[slot.item.source.scope as keyof typeof SCOPE_LABEL]}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {slot.state === "SATISFIED" && (
            <span className="text-success text-[11px] font-medium">Present</span>
          )}
          {slot.state === "MISSING" && <span className="text-danger text-[11px] font-medium">Missing</span>}
          {slot.state === "STALE" && (
            <span className="text-warning text-[11px] font-medium">Fresh copy needed</span>
          )}
          {slot.state === "NEEDS_CHECK" && (
            <span className="text-danger text-[11px] font-medium">Name mismatch</span>
          )}

          {onTriggerUpload && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onTriggerUpload}
              className="text-muted-foreground hover:text-foreground h-6 text-[10px]"
            >
              <Upload className="mr-1 size-3" />
              Upload
            </Button>
          )}
        </div>
      </div>

      {documents.length > 0 && (
        <div className="border-border/40 space-y-1.5 border-t pt-1">
          {documents.map((doc) => (
            <DocumentChip
              key={doc.id}
              doc={doc}
              claimCode={claimCode}
              documentTypes={documentTypes}
              onPreview={onPreview}
              onMoveOptimistic={onMoveOptimistic}
            />
          ))}
        </div>
      )}
    </div>
  );
}
