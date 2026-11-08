export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="bg-muted h-6 w-32 rounded" />
          <div className="bg-muted h-3.5 w-64 rounded" />
        </div>
        <div className="bg-muted h-8 w-28 rounded" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-border bg-surface h-28 rounded-lg border p-4 shadow-2xs" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="border-border bg-surface h-72 rounded-lg border p-4 shadow-2xs" />
        <div className="border-border bg-surface h-72 rounded-lg border p-4 shadow-2xs" />
      </div>
    </div>
  );
}
