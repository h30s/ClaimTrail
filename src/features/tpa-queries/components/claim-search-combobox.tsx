"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchClaimsToLink } from "../server/actions";

export function ClaimSearchCombobox({
  onSelect,
  disabled,
}: {
  onSelect: (claimId: string) => void;
  disabled?: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<
    Array<{ id: string; code: string; patientName: string; payerName: string }>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = searchTerm.trim();
    if (!term) {
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      searchClaimsToLink({ q: term }).then((res) => {
        setLoading(false);
        if (res.ok) setResults(res.data);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="relative space-y-2">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-3.5" />
        <Input
          placeholder="Search claim code, patient name, or policy number…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={disabled}
          className="h-8 pl-8 text-xs"
        />
        {loading && (
          <Loader2 className="text-muted-foreground absolute top-2.5 right-2.5 size-3.5 animate-spin" />
        )}
      </div>

      {searchTerm.trim().length > 0 && results.length > 0 && (
        <div className="bg-popover text-popover-foreground absolute z-20 max-h-48 w-full overflow-y-auto rounded-md border p-1 shadow-md">
          {results.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onSelect(c.id);
                setSearchTerm("");
              }}
              className="hover:bg-muted flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs transition-colors"
            >
              <span className="font-semibold">
                {c.code} · {c.patientName}
              </span>
              <span className="text-muted-foreground text-[11px]">{c.payerName}</span>
            </button>
          ))}
        </div>
      )}

      {searchTerm.trim().length > 0 && !loading && results.length === 0 && (
        <div className="text-muted-foreground p-2 text-center text-xs">No matching open claims found.</div>
      )}
    </div>
  );
}
