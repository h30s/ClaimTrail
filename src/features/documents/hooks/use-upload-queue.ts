"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadManager, type UploadItem } from "./upload-manager";

export type { UploadItem, UploadItemStatus } from "./upload-manager";

export function useUploadQueue(claimCode: string) {
  const router = useRouter();
  const [items, setItems] = useState<UploadItem[]>([]);
  const managerRef = useRef<UploadManager | null>(null);

  useEffect(() => {
    managerRef.current = new UploadManager(claimCode, setItems, () => {
      router.refresh();
    });
  }, [claimCode, router]);

  const addFiles = useCallback((files: FileList | File[]) => {
    managerRef.current?.addFiles(files);
  }, []);

  const clearDone = useCallback(() => {
    managerRef.current?.clearDone();
  }, []);

  return { items, addFiles, clearDone };
}
