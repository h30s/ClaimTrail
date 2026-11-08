"use client";

import { useTransition } from "react";
import { useDraggable } from "@dnd-kit/core";
import { AlertCircle, CheckCircle2, FileImage, FileText, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DocumentDto } from "../types";
import { confirmIdentity, removeDocument } from "../server/actions";
import { MoveToMenu } from "./move-to-menu";

export function DocumentChip({
  doc,
  claimCode,
  documentTypes,
  onPreview,
  onMoveOptimistic,
  draggable = true,
}: {
  doc: DocumentDto;
  claimCode: string;
  documentTypes: Array<{ key: string; label: string }>;
  onPreview: (doc: DocumentDto) => void;
  onMoveOptimistic?: (targetKey: string | null) => void;
  draggable?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: doc.id,
    disabled: !draggable || isPending,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  const isPdf = doc.mimeType === "application/pdf";
  const confPct = doc.ai.confidence !== null ? Math.round(doc.ai.confidence * 100) : null;
  const isMismatch = doc.identityCheck === "MISMATCH";

  const handleConfirmIdentity = () => {
    startTransition(async () => {
      const res = await confirmIdentity({ documentId: doc.id, claimCode });
      if (!res.ok) {
        toast.error(res.error || "Could not confirm identity.");
      } else {
        toast.success("Patient identity confirmed.");
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group border-border bg-surface relative flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs shadow-xs transition-opacity ${
        isDragging ? "ring-primary opacity-50 shadow-md ring-2" : "hover:border-foreground/30"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        onClick={() => onPreview(doc)}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 select-none"
      >
        {isPdf ? (
          <FileText className="text-muted-foreground size-4 shrink-0" />
        ) : (
          <FileImage className="text-muted-foreground size-4 shrink-0" />
        )}

        <span className="text-foreground truncate font-medium">{doc.fileName}</span>

        {confPct !== null && doc.sortedBy === "AI" && (
          <span className="text-muted-foreground shrink-0 font-mono text-[10px]">AI {confPct}%</span>
        )}

        {doc.sortedBy === "USER" && <span className="text-muted-foreground shrink-0 text-[10px]">Moved</span>}

        {isMismatch && (
          <Badge variant="destructive" className="h-5 gap-1 px-1.5 text-[10px]">
            <AlertCircle className="size-3" />
            Mismatch
          </Badge>
        )}

        {doc.identityCheck === "CONFIRMED" && (
          <span className="text-success inline-flex items-center gap-0.5 text-[10px]">
            <CheckCircle2 className="size-3" />
            Confirmed
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground size-6"
              >
                <MoreVertical className="size-3.5" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="text-xs" onClick={() => onPreview(doc)}>
              Preview file
            </DropdownMenuItem>

            <MoveToMenu
              documentId={doc.id}
              claimCode={claimCode}
              documentTypes={documentTypes}
              currentTypeKey={doc.documentTypeKey}
              onMoveOptimistic={onMoveOptimistic}
            >
              <div className="hover:bg-accent hover:text-accent-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-xs outline-hidden select-none">
                Move to...
              </div>
            </MoveToMenu>

            {isMismatch && (
              <DropdownMenuItem className="text-primary text-xs" onClick={handleConfirmIdentity}>
                It&apos;s this patient&apos;s
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive focus:text-destructive text-xs"
              onClick={handleRemove}
            >
              <Trash2 className="mr-2 size-3.5" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
