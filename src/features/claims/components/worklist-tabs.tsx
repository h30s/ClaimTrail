import Link from "next/link";
import { cn } from "@/lib/utils";
import type { WorklistTab } from "../types";

export function WorklistTabs({
  currentTab,
  counts,
  searchParams,
}: {
  currentTab: WorklistTab;
  counts: Record<string, number>;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const tabs: Array<{ id: WorklistTab; label: string }> = [
    { id: "action", label: "Needs action" },
    { id: "open", label: "All open" },
    { id: "sent", label: "Sent" },
    { id: "settled", label: "Settled" },
  ];

  const buildUrl = (tab: WorklistTab) => {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(searchParams)) {
      if (key !== "tab" && typeof val === "string") {
        params.set(key, val);
      }
    }
    if (tab !== "action") {
      params.set("tab", tab);
    }
    const query = params.toString();
    return `/claims${query ? `?${query}` : ""}`;
  };

  return (
    <div className="border-border no-scrollbar flex overflow-x-auto border-b text-sm">
      {tabs.map((tab) => {
        const active = currentTab === tab.id;
        const count = counts[tab.id] ?? 0;

        return (
          <Link
            key={tab.id}
            href={buildUrl(tab.id)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-2.5 font-medium whitespace-nowrap transition-colors",
              active
                ? "border-primary text-primary"
                : "text-muted-foreground hover:text-foreground hover:border-border border-transparent",
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "py-0.2 rounded-full px-1.5 font-mono text-[11px]",
                active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
