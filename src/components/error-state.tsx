"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this page. Please try again.",
  retry,
}: {
  title?: string;
  message?: string;
  retry?: () => void;
}) {
  return (
    <div className="border-danger/20 bg-danger-soft flex min-h-64 flex-col items-center justify-center rounded-lg border p-8 text-center">
      <div className="bg-danger/10 text-danger flex size-10 items-center justify-center rounded-full">
        <AlertCircle className="size-5" />
      </div>
      <h3 className="text-danger mt-4 text-base font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-md text-sm">{message}</p>
      {retry && (
        <Button variant="outline" size="sm" onClick={retry} className="mt-4">
          <RefreshCw className="mr-2 size-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}
