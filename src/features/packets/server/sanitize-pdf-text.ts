export function sanitizePdfText(str: string): string {
  if (!str) return "";
  return str
    .replace(/₹/g, "Rs.")
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/•/g, "*")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, " ");
}
