"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { ACCEPT_ATTRIBUTE } from "../domain/file-rules";

export function UploadDropzone({
  onFilesSelected,
  disabled = false,
}: {
  onFilesSelected: (files: FileList | File[]) => void;
  disabled?: boolean;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`border-border bg-surface-subtle/40 hover:bg-surface-subtle/80 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
        isDragOver ? "border-primary bg-primary/5 ring-primary/20 ring-2" : ""
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTRIBUTE}
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="bg-surface border-border rounded-full border p-2.5 shadow-xs">
        <UploadCloud className="text-muted-foreground size-5" />
      </div>

      <div className="space-y-1">
        <p className="text-foreground text-xs font-medium">
          Drag & drop claim documents, or <span className="text-primary underline">browse</span>
        </p>
        <p className="text-muted-foreground text-[11px]">
          PDF, JPG, PNG up to 4 MB · Gemini will read and file automatically
        </p>
      </div>
    </div>
  );
}
