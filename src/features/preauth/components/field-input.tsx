import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PreauthField } from "../domain/preauth-fields";

export function FieldInput({
  kind,
  value,
  onChange,
  disabled,
}: {
  kind: PreauthField["kind"];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  if (kind === "longText") {
    return (
      <Textarea
        rows={3}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs"
      />
    );
  }

  if (kind === "gender") {
    return (
      <Select value={value} onValueChange={(val) => onChange(val ?? "")} disabled={disabled}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Select gender" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="MALE" className="text-xs">
            MALE
          </SelectItem>
          <SelectItem value="FEMALE" className="text-xs">
            FEMALE
          </SelectItem>
          <SelectItem value="OTHER" className="text-xs">
            OTHER
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }

  if (kind === "rupees") {
    return (
      <div className="relative">
        <span className="text-muted-foreground pointer-events-none absolute top-2 left-2.5 text-xs font-medium">
          ₹
        </span>
        <Input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 pl-6 font-mono text-xs"
          placeholder="0"
        />
      </div>
    );
  }

  if (kind === "date") {
    return (
      <Input
        type="date"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-xs"
      />
    );
  }

  if (kind === "integer") {
    return (
      <Input
        type="number"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 font-mono text-xs"
      />
    );
  }

  return (
    <Input
      type="text"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 text-xs"
    />
  );
}
