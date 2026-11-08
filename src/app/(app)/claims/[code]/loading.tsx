import { Skeleton } from "@/components/ui/skeleton";

export default function ClaimDetailLoading() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="border-border border-y py-3">
        <Skeleton className="h-8 w-full max-w-lg" />
      </div>

      <Skeleton className="h-9 w-full" />

      <div className="border-border flex gap-4 border-b pb-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-7 w-24" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        <div className="border-border bg-surface space-y-3 rounded-lg border p-4">
          <Skeleton className="h-5 w-48" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-border/40 flex items-center justify-between border-b py-2">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>

        <div className="border-border bg-surface space-y-3 rounded-lg border p-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
