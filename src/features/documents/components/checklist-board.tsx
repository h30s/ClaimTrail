"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";
import type { Stage } from "@/lib/enums";
import type { GapReport } from "@/features/checklist/domain/compute-gaps";
import type { DocumentDto } from "../types";
import { useUploadQueue } from "../hooks/use-upload-queue";
import { moveDocument } from "../server/actions";
import { UploadDropzone } from "./upload-dropzone";
import { UploadProgressList } from "./upload-progress-list";
import { NeedsSortingTray } from "./needs-sorting-tray";
import { DroppableSlot } from "./droppable-slot";
import { OtherDocuments } from "./other-documents";
import { DocumentPreviewSheet } from "./document-preview-sheet";

export function ChecklistBoard({
  gaps,
  stage,
  payerName,
  procedureName,
  claimCode,
  documents: initialDocs,
  catalogDocTypes,
}: {
  gaps: GapReport;
  stage: Stage;
  payerName: string;
  procedureName: string;
  claimCode: string;
  documents: DocumentDto[];
  catalogDocTypes: Array<{ id: string; key: string; label: string }>;
}) {
  const [, startTransition] = useTransition();
  const [previewDoc, setPreviewDoc] = useState<DocumentDto | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { items: uploadItems, addFiles, clearDone } = useUploadQueue(claimCode);

  const [docs, setOptimisticDocs] = useOptimistic(
    initialDocs,
    (current, update: { docId: string; targetKey: string | null }) => {
      const targetType = catalogDocTypes.find((t) => t.key === update.targetKey);
      return current.map((d) => {
        if (d.id !== update.docId) return d;
        return {
          ...d,
          documentTypeKey: update.targetKey,
          documentTypeId: targetType?.id ?? null,
          documentTypeLabel: targetType?.label ?? null,
          status: update.targetKey ? "SORTED" : "NEEDS_REVIEW",
          sortedBy: "USER",
        };
      });
    },
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const typeKeyToId = new Map(catalogDocTypes.map((t) => [t.key, t.id]));
  const idToType = new Map(catalogDocTypes.map((t) => [t.id, t]));

  const activeSlotTypeIds = new Set(gaps.slots.map((s) => s.item.documentTypeId));

  const trayDocs = docs.filter((d) => d.status === "NEEDS_REVIEW" || !d.documentTypeKey);
  const stageDocs = docs.filter(
    (d) =>
      d.status === "SORTED" &&
      d.documentTypeKey &&
      activeSlotTypeIds.has(typeKeyToId.get(d.documentTypeKey) ?? ""),
  );
  const otherDocs = docs.filter(
    (d) =>
      d.status === "SORTED" &&
      d.documentTypeKey &&
      !activeSlotTypeIds.has(typeKeyToId.get(d.documentTypeKey) ?? ""),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const docId = active.id as string;
    const targetKey = over.id === "TRAY" ? null : (over.id as string);

    startTransition(async () => {
      setOptimisticDocs({ docId, targetKey });
      const res = await moveDocument({ documentId: docId, documentTypeKey: targetKey, claimCode });
      if (!res.ok) {
        toast.error(res.error || "Could not move document.");
      }
    });
  };

  const handleOpenPreview = (doc: DocumentDto) => {
    setPreviewDoc(doc);
    setIsPreviewOpen(true);
  };

  const satisfiedCount = gaps.slots.filter((s) => s.state === "SATISFIED").length;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <div className="border-border bg-surface flex items-center justify-between rounded-lg border p-4">
          <div>
            <h2 className="text-foreground text-sm font-semibold">
              {stage === "PRE_AUTH"
                ? "Pre-auth checklist"
                : stage === "ENHANCEMENT"
                  ? "Enhancement checklist"
                  : "Final bill checklist"}
            </h2>
            <p className="text-muted-foreground text-xs">
              {payerName} · {procedureName}
            </p>
          </div>
          <span className="text-foreground font-mono text-xs font-medium">
            {satisfiedCount} of {gaps.slots.length}
          </span>
        </div>

        <UploadDropzone onFilesSelected={addFiles} />
        <UploadProgressList items={uploadItems} onClearDone={clearDone} />

        <NeedsSortingTray
          documents={trayDocs}
          claimCode={claimCode}
          documentTypes={catalogDocTypes}
          onPreview={handleOpenPreview}
          onMoveOptimistic={(targetKey) => {
            const first = trayDocs[0];
            if (first) {
              startTransition(() => {
                setOptimisticDocs({ docId: first.id, targetKey });
              });
            }
          }}
        />

        <div className="space-y-2">
          {gaps.slots.map((slot) => {
            const typeInfo = idToType.get(slot.item.documentTypeId);
            const typeKey = typeInfo?.key ?? slot.item.documentTypeId;
            const label = typeInfo?.label ?? slot.item.documentTypeId;
            const slotDocs = stageDocs.filter((d) => d.documentTypeKey === typeKey);

            return (
              <DroppableSlot
                key={slot.item.documentTypeId}
                slot={slot}
                label={label}
                typeKey={typeKey}
                documents={slotDocs}
                claimCode={claimCode}
                documentTypes={catalogDocTypes}
                onPreview={handleOpenPreview}
                onTriggerUpload={() => {
                  const input = document.querySelector<HTMLInputElement>('input[type="file"][multiple]');
                  input?.click();
                }}
              />
            );
          })}
        </div>

        <OtherDocuments
          documents={otherDocs}
          claimCode={claimCode}
          documentTypes={catalogDocTypes}
          onPreview={handleOpenPreview}
        />

        <DocumentPreviewSheet doc={previewDoc} open={isPreviewOpen} onOpenChange={setIsPreviewOpen} />
      </div>
    </DndContext>
  );
}
