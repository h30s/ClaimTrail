import { Badge } from "@/components/ui/badge";

export function RequirementChip({
  requirement,
  needsFreshCopy,
}: {
  requirement: "REQUIRED" | "OPTIONAL" | "NONE" | "NOT_NEEDED";
  needsFreshCopy?: boolean;
}) {
  if (requirement === "NONE" || requirement === "NOT_NEEDED") {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <Badge variant={requirement === "REQUIRED" ? "danger" : "warning"}>
        {requirement === "REQUIRED" ? "Required" : "Optional"}
      </Badge>
      {needsFreshCopy && (
        <Badge variant="neutral" className="text-[10px]">
          Fresh copy
        </Badge>
      )}
    </div>
  );
}
