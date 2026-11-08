// countdown.ts — Reply clock for a TPA query. Amber from 2 h before the deadline.
import { QUERY_DUE_SOON_MS } from "@/features/claims/domain/targets";

export type CountdownState = "ON_TRACK" | "DUE_SOON" | "OVERDUE" | "ANSWERED";

export type Countdown = {
  state: CountdownState;
  msLeft: number;
  answeredOnTime: boolean | null;
};

export function getCountdown(input: { now: Date; dueAt: Date; repliedAt: Date | null }): Countdown {
  const { now, dueAt, repliedAt } = input;

  if (repliedAt) {
    return {
      state: "ANSWERED",
      msLeft: dueAt.getTime() - repliedAt.getTime(),
      answeredOnTime: repliedAt <= dueAt,
    };
  }

  const msLeft = dueAt.getTime() - now.getTime();
  if (msLeft < 0) {
    return { state: "OVERDUE", msLeft, answeredOnTime: null };
  }

  return {
    state: msLeft <= QUERY_DUE_SOON_MS ? "DUE_SOON" : "ON_TRACK",
    msLeft,
    answeredOnTime: null,
  };
}
