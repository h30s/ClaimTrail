"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { PreauthField } from "../domain/preauth-fields";
import type { FieldView } from "../domain/field-states";
import { normaliseSuggestion, valueSchemaFor } from "../domain/field-value";
import { confirmPreauthField } from "../server/actions";
import { FieldInput } from "./field-input";
import { SourceQuote } from "./source-quote";
import { SuggestionOptions } from "./suggestion-options";

export function FieldRow({
  field,
  view,
  claimCode,
}: {
  field: PreauthField;
  view: FieldView;
  claimCode: string;
}) {
  const [isPending, startTransition] = useTransition();

  const initialValue =
    view.state === "CONFIRMED"
      ? view.value
      : view.state === "SUGGESTED" && view.options[0]
        ? view.options[0].value
        : "";

  const initialSuggestionId =
    view.state === "SUGGESTED" && view.options[0] ? view.options[0].suggestionId : undefined;

  const [currentValue, setCurrentValue] = useState(initialValue);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | undefined>(initialSuggestionId);
  const [error, setError] = useState<string | null>(null);

  const handleValueChange = (val: string) => {
    setCurrentValue(val);
    const normalised = normaliseSuggestion(field.kind, val);
    const parsed = valueSchemaFor(field.kind).safeParse(normalised);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid value");
    } else {
      setError(null);
    }
  };

  const handleConfirm = () => {
    const normalised = normaliseSuggestion(field.kind, currentValue);
    const parsed = valueSchemaFor(field.kind).safeParse(normalised);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid value");
      return;
    }

    startTransition(async () => {
      const res = await confirmPreauthField({
        claimCode,
        fieldKey: field.key,
        value: normalised,
        suggestionId: selectedSuggestionId,
      });

      if (!res.ok) {
        toast.error(res.error || "Could not confirm field.");
      } else {
        toast.success(`Confirmed ${field.label}`);
      }
    });
  };

  const isConfirmedWithSameValue =
    view.state === "CONFIRMED" &&
    normaliseSuggestion(field.kind, currentValue) === normaliseSuggestion(field.kind, view.value);

  const isConfirmDisabled = isPending || !currentValue.trim() || !!error || isConfirmedWithSameValue;

  return (
    <div className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-4 text-xs">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-foreground font-medium">{field.label}</span>
            <span className="text-muted-foreground font-mono text-[10px]">({field.kind})</span>
          </div>
          <p className="text-muted-foreground text-[11px]">{field.aiHint}</p>
        </div>

        <div className="flex w-full shrink-0 items-start gap-2 sm:w-72">
          <div className="flex-1 space-y-1">
            <FieldInput
              kind={field.kind}
              value={currentValue}
              onChange={handleValueChange}
              disabled={isPending}
            />
            {error && <p className="text-destructive text-[10px]">{error}</p>}
          </div>

          <Button
            size="xs"
            disabled={isConfirmDisabled}
            onClick={handleConfirm}
            className="h-8 shrink-0 text-xs"
          >
            Confirm
          </Button>
        </div>
      </div>

      <div className="border-border/40 border-t pt-2">
        {view.state === "CONFIRMED" && (
          <div className="text-success flex items-center gap-1.5 text-[11px] font-medium">
            <CheckCircle2 className="size-3.5" />
            <span>
              Confirmed by {view.confirmedBy} · {new Date(view.confirmedAt).toLocaleTimeString()}
            </span>
          </div>
        )}

        {view.state === "SUGGESTED" && (
          <div className="space-y-2">
            {view.options.length === 1 && view.options[0] && (
              <div className="space-y-1.5">
                <div className="text-primary flex items-center gap-1 text-[11px] font-medium">
                  <Sparkles className="size-3" />
                  <span>AI suggested ({Math.round(view.options[0].confidence * 100)}% confidence)</span>
                </div>
                <SourceQuote
                  documentLabel={view.options[0].documentLabel}
                  snippet={view.options[0].snippet}
                  confidence={view.options[0].confidence}
                />
              </div>
            )}

            {view.options.length > 1 && (
              <SuggestionOptions
                options={view.options}
                selectedValue={currentValue}
                onSelect={(val, sugId) => {
                  handleValueChange(val);
                  setSelectedSuggestionId(sugId);
                }}
              />
            )}
          </div>
        )}

        {view.state === "EMPTY" && (
          <p className="text-muted-foreground text-[11px] italic">
            No suggestion yet — type the verified value, or upload a document that states it.
          </p>
        )}
      </div>
    </div>
  );
}
