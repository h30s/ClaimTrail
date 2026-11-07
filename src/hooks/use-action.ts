"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/action";

type Options<R> = {
  success?: string | ((data: R) => string);
  onSuccess?: (data: R) => void;
};

export function useAction<I, R>(action: (input: I) => Promise<ActionResult<R>>, options: Options<R> = {}) {
  const [pending, startTransition] = useTransition();

  const run = (input: I) =>
    new Promise<ActionResult<R>>((resolve) => {
      startTransition(async () => {
        const result = await action(input);
        if (result.ok) {
          const message =
            typeof options.success === "function" ? options.success(result.data) : options.success;
          if (message) toast.success(message);
          options.onSuccess?.(result.data);
        } else {
          toast.error(result.error);
        }
        resolve(result);
      });
    });

  return { run, pending };
}
