"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ClaimTabs({ code }: { code: string }) {
  const pathname = usePathname();

  const tabs = [
    { label: "Documents", href: `/claims/${code}`, exact: true },
    { label: "Pre-auth form", href: `/claims/${code}/preauth`, exact: false },
    { label: "Activity", href: `/claims/${code}/activity`, exact: false },
  ];

  return (
    <div className="border-border no-scrollbar flex overflow-x-auto border-b text-sm">
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "border-b-2 px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors",
              active
                ? "border-primary text-primary"
                : "text-muted-foreground hover:text-foreground hover:border-border border-transparent",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
