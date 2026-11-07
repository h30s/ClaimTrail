import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { FieldErrors } from "@/lib/action";

export function applyFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fieldErrors?: FieldErrors,
): void {
  if (!fieldErrors) return;
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages && messages.length > 0 && messages[0]) {
      setError(key as Path<T>, { type: "server", message: messages[0] });
    }
  }
}
