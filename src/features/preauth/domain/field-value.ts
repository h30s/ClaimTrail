import { z } from "zod";
import type { PreauthField } from "./preauth-fields";

const SCHEMAS = {
  text: z.string().trim().min(1, "Required").max(120, "Maximum 120 characters"),
  longText: z.string().trim().min(1, "Required").max(600, "Maximum 600 characters"),
  integer: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, "Whole number up to 3 digits"),
  rupees: z
    .string()
    .trim()
    .regex(/^\d{1,9}$/, "Digits only, in rupees"),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
} satisfies Record<PreauthField["kind"], z.ZodType<string>>;

export const valueSchemaFor = (kind: PreauthField["kind"]) => SCHEMAS[kind];

export function normaliseSuggestion(kind: PreauthField["kind"], raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  switch (kind) {
    case "rupees": {
      // Remove currency symbols, commas, and trailing cents
      const cleaned = trimmed
        .replace(/₹|rs\.?|inr/gi, "")
        .replace(/,/g, "")
        .replace(/\.00$/, "")
        .trim();
      const match = /\d+/.exec(cleaned);
      return match ? match[0] : cleaned;
    }

    case "integer": {
      // Handle "54 yrs", "54 years", "2 days"
      const match = /\d+/.exec(trimmed);
      return match ? match[0] : trimmed;
    }

    case "gender": {
      const lower = trimmed.toLowerCase().replace(/[^a-z]/g, "");
      if (lower === "m" || lower === "male") return "MALE";
      if (lower === "f" || lower === "female") return "FEMALE";
      if (lower === "other" || lower === "transgender") return "OTHER";
      return trimmed.toUpperCase();
    }

    case "date": {
      // YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

      // DD/MM/YYYY or DD-MM-YYYY (Indian format)
      const dmy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(trimmed);
      if (dmy && dmy[1] && dmy[2] && dmy[3]) {
        const day = dmy[1].padStart(2, "0");
        const month = dmy[2].padStart(2, "0");
        const year = dmy[3];
        return `${year}-${month}-${day}`;
      }

      // ISO string with time
      if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
        return trimmed.slice(0, 10);
      }

      return trimmed;
    }

    case "text":
    case "longText":
      return trimmed.replace(/\s+/g, " ");

    default:
      return trimmed;
  }
}
