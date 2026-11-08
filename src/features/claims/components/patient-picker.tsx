"use client";

import { useState } from "react";
import { Check, Search, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import type { CreateClaimInput } from "../schemas";
import { searchPatients } from "../server/actions";
import type { SearchedPatientDto } from "../server/search-patients";

export function PatientPicker({
  selectedPatient,
  onSelectPatient,
  isNewPatient,
  onToggleNewPatient,
  register,
  setValue,
  gender,
  errors,
}: {
  selectedPatient: SearchedPatientDto | null;
  onSelectPatient: (p: SearchedPatientDto | null) => void;
  isNewPatient: boolean;
  onToggleNewPatient: (val: boolean) => void;
  register: UseFormRegister<CreateClaimInput>;
  setValue: UseFormSetValue<CreateClaimInput>;
  gender?: string;
  errors: FieldErrors<CreateClaimInput>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchedPatientDto[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const res = await searchPatients({ q: val });
    if (res.ok && res.data) {
      setResults(res.data);
    }
    setSearching(false);
  };

  if (selectedPatient) {
    return (
      <div className="border-border bg-surface flex items-center justify-between rounded-lg border p-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full">
            <User className="size-4" />
          </div>
          <div>
            <p className="text-foreground text-sm font-medium">{selectedPatient.name}</p>
            <p className="text-muted-foreground font-mono text-xs">
              UHID: {selectedPatient.uhid} · {selectedPatient.gender}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => {
            onSelectPatient(null);
            setValue("patientId", undefined);
          }}
        >
          Change
        </Button>
      </div>
    );
  }

  if (isNewPatient) {
    return (
      <div className="border-border bg-muted/20 space-y-3 rounded-lg border p-3.5">
        <div className="border-border/60 flex items-center justify-between border-b pb-2">
          <span className="text-foreground text-xs font-semibold">New Patient Details</span>
          <Button type="button" variant="ghost" size="xs" onClick={() => onToggleNewPatient(false)}>
            Search existing instead
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Full Name</Label>
            <Input className="h-8 text-xs" {...register("patientName")} />
            {errors.patientName?.message && (
              <p className="text-danger text-xs">{errors.patientName.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs">UHID (Hospital ID)</Label>
            <Input className="h-8 font-mono text-xs" placeholder="NSK-2045xx" {...register("patientUhid")} />
            {errors.patientUhid?.message && (
              <p className="text-danger text-xs">{errors.patientUhid.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Gender</Label>
            <Select
              value={gender || null}
              onValueChange={(val) => {
                if (val) setValue("patientGender", val as "MALE" | "FEMALE" | "OTHER");
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Date of Birth</Label>
            <Input type="date" className="h-8 text-xs" {...register("patientDob")} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search patient by name or UHID…"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => onToggleNewPatient(true)}
          className="h-8 shrink-0 gap-1"
        >
          <UserPlus className="size-3.5" />
          <span>New patient</span>
        </Button>
      </div>

      {results.length > 0 && (
        <div className="border-border bg-surface divide-border/60 max-h-48 divide-y overflow-y-auto rounded-lg border shadow-md">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onSelectPatient(p);
                setValue("patientId", p.id);
                setResults([]);
                setQuery("");
              }}
              className="hover:bg-muted/40 flex w-full items-center justify-between p-2.5 text-left text-xs transition-colors"
            >
              <div>
                <p className="text-foreground font-medium">{p.name}</p>
                <p className="text-muted-foreground font-mono text-[11px]">
                  UHID: {p.uhid} · {p.gender}
                </p>
              </div>
              <Check className="text-muted-foreground/40 size-3.5" />
            </button>
          ))}
        </div>
      )}
      {query.length >= 2 && results.length === 0 && !searching && (
        <p className="text-muted-foreground pl-1 text-xs italic">
          No patients found. Click &ldquo;New patient&rdquo; to add.
        </p>
      )}
    </div>
  );
}
