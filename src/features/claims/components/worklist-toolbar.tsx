"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PayerDto } from "@/features/catalog/server/queries";

export type AssigneeOption = {
  id: string;
  name: string;
};

export function WorklistToolbar({
  payers,
  assignees,
  isHead,
}: {
  payers: PayerDto[];
  assignees: AssigneeOption[];
  isHead: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const updateParam = (key: string, val: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!val || val === "all") {
      params.delete(key);
    } else {
      params.set(key, val);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateParam("q", e.target.value.trim() || null);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-sm flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search patient, claim or policy…"
          defaultValue={searchParams.get("q") ?? ""}
          onChange={handleSearch}
          className="h-9 pl-9 text-xs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          items={[
            { value: "all", label: "All payers" },
            ...payers.map((p) => ({ value: p.id, label: p.name })),
          ]}
          value={searchParams.get("payer") ?? "all"}
          onValueChange={(val) => updateParam("payer", val)}
        >
          <SelectTrigger className="h-9 w-40 text-xs">
            <SelectValue placeholder="All payers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payers</SelectItem>
            {payers.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isHead && (
          <Select
            items={[
              { value: "all", label: "All assignees" },
              ...assignees.map((a) => ({ value: a.id, label: a.name })),
            ]}
            value={searchParams.get("assignee") ?? "all"}
            onValueChange={(val) => updateParam("assignee", val)}
          >
            <SelectTrigger className="h-9 w-40 text-xs">
              <SelectValue placeholder="All assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              {assignees.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
