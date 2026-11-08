"use client";

import { useDroppable } from "@dnd-kit/core";
import { Inbox } from "lucide-react";
import type { DocumentDto } from "../types";
import { TrayItem } from "./tray-item";

export function NeedsSortingTray({
  documents,
  claimCode,
  documentTypes,
  onPreview,
  onMoveOptimistic,
}: {
  documents: DocumentDto[];
  claimCode: string;
  documentTypes: Array<{ key: string; label: string }>;
  onPreview: (doc: DocumentDto) => void;
  onMoveOptimistic?: (targetKey: string | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "TRAY",
  });

  if (documents.length === 0) return null;

  return (
    <div
      ref={setNodeRef}
      className={`border-warning/50 bg-warning/5 rounded-lg border p-4 transition-colors ${
        isOver ? "border-warning bg-warning/10 ring-warning/30 ring-2" : ""
      }`}
    >
      <div className="flex items-center gap-2 pb-3">
        <Inbox className="text-warning size-4" />
        <h3 className="text-foreground text-sm font-semibold">Needs sorting</h3>
        <span className="bg-warning/20 text-warning-foreground rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold">
          {documents.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {documents.map((doc) => (
          <TrayItem
            key={doc.id}
            doc={doc}
            claimCode={claimCode}
            documentTypes={documentTypes}
            onPreview={onPreview}
            onMoveOptimistic={onMoveOptimistic}
          />
        ))}
      </div>
    </div>
  );
}
