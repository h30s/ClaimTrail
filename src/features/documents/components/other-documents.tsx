"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Files } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DocumentDto } from "../types";
import { DocumentChip } from "./document-chip";

export function OtherDocuments({
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
  const [isOpen, setIsOpen] = useState(false);

  if (documents.length === 0) return null;

  return (
    <div className="border-border bg-surface rounded-lg border">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-xs font-medium hover:bg-transparent"
      >
        <div className="flex items-center gap-2">
          <Files className="text-muted-foreground size-4" />
          <span>Other uploaded documents</span>
          <span className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 font-mono text-[11px]">
            {documents.length}
          </span>
        </div>
        {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
      </Button>

      {isOpen && (
        <div className="border-border space-y-2 border-t p-4 pt-3">
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
