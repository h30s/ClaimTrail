import type { DocumentDto } from "../types";

export type UploadItemStatus = "queued" | "uploading" | "reading" | "done" | "error";

export type UploadItem = {
  id: string;
  file: File;
  status: UploadItemStatus;
  progress: number;
  result?: DocumentDto;
  error?: string;
};

const MAX_CONCURRENT = 3;

export class UploadManager {
  private items: UploadItem[] = [];
  private activeCount = 0;

  constructor(
    private claimCode: string,
    private onUpdate: (items: UploadItem[]) => void,
    private onAllComplete: () => void,
  ) {}

  addFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    const newItems: UploadItem[] = list.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      status: "queued",
      progress: 0,
    }));

    this.items = [...this.items, ...newItems];
    this.notify();
    this.processNext();
  }

  clearDone() {
    this.items = this.items.filter((it) => it.status !== "done" && it.status !== "error");
    this.notify();
  }

  private notify() {
    this.onUpdate([...this.items]);
  }

  private processNext() {
    while (this.activeCount < MAX_CONCURRENT) {
      const nextItem = this.items.find((it) => it.status === "queued");
      if (!nextItem) break;

      this.activeCount += 1;
      nextItem.status = "uploading";
      const itemId = nextItem.id;
      const file = nextItem.file;

      this.notify();

      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/claims/${this.claimCode}/documents`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const pct = Math.round((event.loaded / event.total) * 100);
          const target = this.items.find((it) => it.id === itemId);
          if (target) {
            target.progress = Math.min(pct, 95);
            this.notify();
          }
        }
      };

      xhr.upload.onload = () => {
        const target = this.items.find((it) => it.id === itemId);
        if (target) {
          target.status = "reading";
          target.progress = 100;
          this.notify();
        }
      };

      xhr.onload = () => {
        this.activeCount -= 1;
        const target = this.items.find((it) => it.id === itemId);
        if (target) {
          try {
            const json = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && json.document) {
              target.status = "done";
              target.progress = 100;
              target.result = json.document;
            } else {
              target.status = "error";
              target.error = json.error || `Upload failed (${xhr.status})`;
            }
          } catch {
            target.status = "error";
            target.error = "Upload failed.";
          }
          this.notify();
        }

        if (
          this.activeCount === 0 &&
          this.items.every((it) => it.status === "done" || it.status === "error")
        ) {
          this.onAllComplete();
        } else {
          this.processNext();
        }
      };

      xhr.onerror = () => {
        this.activeCount -= 1;
        const target = this.items.find((it) => it.id === itemId);
        if (target) {
          target.status = "error";
          target.error = "Network error.";
          this.notify();
        }
        this.processNext();
      };

      xhr.send(formData);
    }
  }
}
