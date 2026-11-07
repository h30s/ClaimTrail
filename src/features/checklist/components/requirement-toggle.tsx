"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type RequirementChoice = "INHERIT" | "REQUIRED" | "OPTIONAL" | "NOT_NEEDED";

export function RequirementToggle({
  value,
  onChange,
  disabled,
  isGlobal,
}: {
  value: RequirementChoice;
  onChange: (val: RequirementChoice) => void;
  disabled?: boolean;
  isGlobal?: boolean;
}) {
  const inheritLabel = isGlobal ? "Not in checklist" : "Inherit";

  return (
    <>
      {/* Desktop view */}
      <div className="hidden sm:inline-block">
        <ToggleGroup
          value={[value]}
          onValueChange={(vals) => {
            const last = vals[vals.length - 1];
            if (last) {
              onChange(last as RequirementChoice);
            }
          }}
          disabled={disabled}
          className="border-border bg-muted/40 rounded-md border p-0.5"
        >
          <ToggleGroupItem value="INHERIT" size="sm" className="px-2.5 py-1 text-xs">
            {inheritLabel}
          </ToggleGroupItem>
          <ToggleGroupItem value="REQUIRED" size="sm" className="text-danger px-2.5 py-1 text-xs font-medium">
            Required
          </ToggleGroupItem>
          <ToggleGroupItem
            value="OPTIONAL"
            size="sm"
            className="text-warning px-2.5 py-1 text-xs font-medium"
          >
            Optional
          </ToggleGroupItem>
          <ToggleGroupItem value="NOT_NEEDED" size="sm" className="text-muted-foreground px-2.5 py-1 text-xs">
            Not needed
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Mobile view */}
      <div className="sm:hidden">
        <Select
          value={value}
          onValueChange={(val) => {
            if (val) onChange(val as RequirementChoice);
          }}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INHERIT">{inheritLabel}</SelectItem>
            <SelectItem value="REQUIRED">Required</SelectItem>
            <SelectItem value="OPTIONAL">Optional</SelectItem>
            <SelectItem value="NOT_NEEDED">Not needed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
