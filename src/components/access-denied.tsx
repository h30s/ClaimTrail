import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function AccessDenied({
  message = "Only the desk head has permission to open this page.",
}: {
  message?: string;
}) {
  return (
    <div className="border-border bg-surface flex min-h-80 flex-col items-center justify-center rounded-lg border p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-amber-800">
        <ShieldAlert className="size-6" />
      </div>
      <h2 className="text-foreground mt-4 text-lg font-semibold">Access Restricted</h2>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">{message}</p>
      <Link href="/claims" className={buttonVariants({ variant: "outline", size: "sm", className: "mt-6" })}>
        Back to Claims
      </Link>
    </div>
  );
}
