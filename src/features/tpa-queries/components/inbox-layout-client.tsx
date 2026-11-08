"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "cn";

export function InboxLayoutClient({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const segment = useSelectedLayoutSegment();
  const hasDetail = segment !== null;

  return (
    <div className="bg-surface flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-xl border shadow-xs lg:flex-row">
      <div
        className={cn(
          "bg-surface flex h-full w-full shrink-0 flex-col overflow-hidden border-r lg:w-[380px]",
          hasDetail ? "hidden lg:flex" : "flex",
        )}
      >
        {sidebar}
      </div>

      <div
        className={cn(
          "bg-background flex h-full flex-1 flex-col overflow-y-auto",
          hasDetail ? "flex" : "hidden lg:flex",
        )}
      >
        {hasDetail && (
          <div className="bg-surface border-b p-3 lg:hidden">
            <Link
              href="/inbox"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to queries</span>
            </Link>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
