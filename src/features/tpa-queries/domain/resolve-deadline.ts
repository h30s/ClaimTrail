// features/tpa-queries/domain/resolve-deadline.ts
// The deadline the email states wins if it is sane; otherwise the
// payer's default reply window applies (A8). The model's date is never trusted blindly.

const MAX_STATED_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type ResolveDeadlineInput = {
  receivedAt: Date;
  statedIso: string | null;
  defaultHours: number;
};

export type ResolvedDeadline = {
  dueAt: Date;
  source: "STATED" | "DEFAULT";
};

export function resolveDeadline(input: ResolveDeadlineInput): ResolvedDeadline {
  const { receivedAt, statedIso, defaultHours } = input;
  const stated = statedIso ? new Date(statedIso) : null;

  const sane =
    stated !== null &&
    !Number.isNaN(stated.getTime()) &&
    stated > receivedAt &&
    stated.getTime() - receivedAt.getTime() <= MAX_STATED_WINDOW_MS;

  return sane
    ? { dueAt: stated, source: "STATED" }
    : { dueAt: new Date(receivedAt.getTime() + defaultHours * 3_600_000), source: "DEFAULT" };
}
