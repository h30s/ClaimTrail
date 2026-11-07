// Display formatting for India: rupees with lakh grouping, IST date-times, short durations.
const IST = "Asia/Kolkata";
const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const dateTime = new Intl.DateTimeFormat("en-IN", {
  timeZone: IST,
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const dateKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: IST,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const formatInr = (rupees: number) => inr.format(rupees);
export const formatLakh = (rupees: number) => `₹${(rupees / 100_000).toFixed(1)} L`;
export const formatDateTime = (d: Date) => dateTime.format(d);
/** "2026-11-07" in IST — for same-day comparisons. */
export const istDateKey = (d: Date) => dateKey.format(d);

export function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.round(Math.abs(ms) / 60_000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins.toString().padStart(2, "0")}m`;
  return `${mins}m`;
}
