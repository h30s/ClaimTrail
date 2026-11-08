import { PREAUTH_FIELDS, type PreauthFieldKey } from "./preauth-fields";
import { normaliseSuggestion, valueSchemaFor } from "./field-value";

export type SuggestionOption = {
  suggestionId: string;
  value: string;
  confidence: number;
  snippet: string;
  documentLabel: string;
};

export type FieldView =
  | {
      key: PreauthFieldKey;
      state: "CONFIRMED";
      value: string;
      confirmedBy: string;
      confirmedAt: Date;
    }
  | {
      key: PreauthFieldKey;
      state: "SUGGESTED";
      options: SuggestionOption[];
    }
  | {
      key: PreauthFieldKey;
      state: "EMPTY";
    };

export type ConfirmedFieldInput = {
  fieldKey: string;
  value: string;
  confirmedBy: { name: string };
  confirmedAt: Date;
};

export type SuggestionInput = {
  id: string;
  fieldKey: string;
  value: string;
  confidence: number;
  sourceSnippet: string;
  document: {
    documentType?: { label: string } | null;
    fileName: string;
  };
};

export function buildFieldViews(
  confirmed: ConfirmedFieldInput[],
  suggestions: SuggestionInput[],
): FieldView[] {
  const confirmedMap = new Map(confirmed.map((c) => [c.fieldKey, c]));

  // Group and normalize suggestions per fieldKey
  const suggestionsByField = new Map<string, SuggestionInput[]>();
  for (const s of suggestions) {
    const list = suggestionsByField.get(s.fieldKey) ?? [];
    list.push(s);
    suggestionsByField.set(s.fieldKey, list);
  }

  return PREAUTH_FIELDS.map((field): FieldView => {
    const conf = confirmedMap.get(field.key);
    if (conf) {
      return {
        key: field.key,
        state: "CONFIRMED",
        value: conf.value,
        confirmedBy: conf.confirmedBy.name,
        confirmedAt: conf.confirmedAt,
      };
    }

    const rawList = suggestionsByField.get(field.key) ?? [];
    const validOptionsMap = new Map<string, SuggestionOption>();

    for (const raw of rawList) {
      const normalised = normaliseSuggestion(field.kind, raw.value);
      if (!valueSchemaFor(field.kind).safeParse(normalised).success) {
        continue;
      }

      const docLabel = raw.document.documentType?.label ?? raw.document.fileName;
      const existing = validOptionsMap.get(normalised);

      if (!existing || raw.confidence > existing.confidence) {
        validOptionsMap.set(normalised, {
          suggestionId: raw.id,
          value: normalised,
          confidence: raw.confidence,
          snippet: raw.sourceSnippet,
          documentLabel: docLabel,
        });
      }
    }

    const options = Array.from(validOptionsMap.values()).sort((a, b) => b.confidence - a.confidence);

    if (options.length > 0) {
      return {
        key: field.key,
        state: "SUGGESTED",
        options,
      };
    }

    return {
      key: field.key,
      state: "EMPTY",
    };
  });
}

export function fieldProgress(views: FieldView[]): { confirmed: number; total: number } {
  const confirmed = views.filter((v) => v.state === "CONFIRMED").length;
  return { confirmed, total: views.length };
}
