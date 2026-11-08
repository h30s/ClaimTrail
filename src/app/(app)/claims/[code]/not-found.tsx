import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClaimNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center">
      <div className="bg-muted flex size-12 items-center justify-center rounded-full">
        <FileQuestion className="text-muted-foreground size-6" />
      </div>
      <div className="space-y-1">
        <h2 className="text-foreground text-base font-semibold">Claim not found</h2>
        <p className="text-muted-foreground max-w-sm text-xs">
          Claim not found, or it isn&apos;t assigned to you.
        </p>
      </div>
      <Button variant="outline" size="sm" render={<Link href="/claims" />} className="gap-1.5">
        <ArrowLeft className="size-3.5" />
        <span>Back to claims</span>
      </Button>
    </div>
  );
}
