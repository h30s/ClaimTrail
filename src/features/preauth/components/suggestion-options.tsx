import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SuggestionOption } from "../domain/field-states";
import { SourceQuote } from "./source-quote";

export function SuggestionOptions({
  options,
  selectedValue,
  onSelect,
}: {
  options: SuggestionOption[];
  selectedValue: string;
  onSelect: (value: string, suggestionId: string) => void;
}) {
  return (
    <div className="space-y-2 pt-1">
      <div className="text-warning flex items-center gap-1.5 text-[11px] font-medium">
        <span>Sources disagree — choose the verified value:</span>
      </div>

      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = selectedValue === opt.value;
          return (
            <div
              key={opt.suggestionId}
              onClick={() => onSelect(opt.value, opt.suggestionId)}
              className={`cursor-pointer space-y-1.5 rounded-lg border p-2.5 text-xs transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5 ring-primary/30 ring-1"
                  : "border-border bg-surface hover:border-foreground/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex size-4 items-center justify-center rounded-full border ${
                      isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {isSelected && <Check className="size-2.5" />}
                  </div>
                  <span className="text-foreground font-semibold">{opt.value}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {Math.round(opt.confidence * 100)}%
                  </Badge>
                  {isSelected && (
                    <Button variant="ghost" size="xs" className="text-primary h-6 text-[10px]">
                      Selected
                    </Button>
                  )}
                </div>
              </div>

              <SourceQuote documentLabel={opt.documentLabel} snippet={opt.snippet} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
