export function StatTile({
  label,
  value,
  secondary,
  targetLine,
  belowTarget = false,
}: {
  label: string;
  value: string | number;
  secondary?: React.ReactNode;
  targetLine?: string;
  belowTarget?: boolean;
}) {
  return (
    <div className="border-border bg-surface rounded-lg border p-4 shadow-2xs">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <span className="text-foreground font-mono text-2xl font-bold tracking-tight">{value}</span>
        {targetLine && (
          <span
            className={`text-xs ${belowTarget ? "font-semibold text-amber-800" : "text-muted-foreground font-medium"}`}
          >
            {targetLine}
          </span>
        )}
      </div>
      {secondary && <div className="text-muted-foreground mt-2 truncate text-xs">{secondary}</div>}
    </div>
  );
}
