import "server-only";
import { fileTypeFromBuffer } from "file-type";
import { ValidationError } from "@/lib/errors";
import { isAllowedMime, MAX_UPLOAD_BYTES, type AllowedMime } from "../domain/file-rules";

export async function sniffUpload(bytes: Uint8Array): Promise<{ mime: AllowedMime; ext: string }> {
  if (bytes.byteLength === 0) {
    throw new ValidationError("The file is empty.");
  }
  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    throw new ValidationError("The file is over 4 MB. Compress it or split it.");
  }

  const type = await fileTypeFromBuffer(bytes);
  if (!type || !isAllowedMime(type.mime)) {
    throw new ValidationError("Only PDF, JPG and PNG files can be uploaded.");
  }

  return { mime: type.mime, ext: type.ext };
}
