"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function PeriodSelect({ currentDays }: { currentDays: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (days: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", days);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor="period-select" className="text-muted-foreground text-xs font-medium">
        Period:
      </label>
      <select
        id="period-select"
        value={currentDays.toString()}
        onChange={(e) => handleSelect(e.target.value)}
        className="border-input bg-surface text-foreground focus:ring-ring rounded-md border px-2.5 py-1 text-xs font-medium shadow-2xs focus:ring-2 focus:outline-none"
      >
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="90">Last 90 days</option>
      </select>
    </div>
  );
}
