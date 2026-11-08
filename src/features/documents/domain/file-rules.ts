// What we accept as an upload (A10). Bytes are sniffed server-side; the browser's type is ignored.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export type AllowedMime = (typeof ALLOWED_MIME_TYPES)[number];
export const isAllowedMime = (m: string): m is AllowedMime =>
  (ALLOWED_MIME_TYPES as readonly string[]).includes(m);
export const ACCEPT_ATTRIBUTE = ".pdf,.jpg,.jpeg,.png";
