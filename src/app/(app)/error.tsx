"use client";

import { ErrorState } from "@/components/error-state";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-12">
      <ErrorState
        title="Unable to load page"
        message={error.message || "An unexpected error occurred."}
        retry={reset}
      />
    </div>
  );
}
