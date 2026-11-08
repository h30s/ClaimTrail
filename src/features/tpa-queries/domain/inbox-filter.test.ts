import { describe, expect, it } from "vitest";
import { compareForInbox, matchesFilter, type InboxQueryItem } from "./inbox-filter";

describe("matchesFilter", () => {
  // Use noon IST: 2026-11-08T06:30:00Z -> IST date is 2026-11-08
  const now = new Date("2026-11-08T06:30:00.000Z");

  const openDueToday: InboxQueryItem = {
    status: "OPEN",
    deadlineAt: new Date("2026-11-08T10:00:00.000Z"),
    claimId: "claim-1",
  };

  const openOverdue: InboxQueryItem = {
    status: "OPEN",
    deadlineAt: new Date("2026-11-08T05:00:00.000Z"),
    claimId: "claim-2",
  };

  const openTomorrow: InboxQueryItem = {
    status: "OPEN",
    deadlineAt: new Date("2026-11-09T08:00:00.000Z"),
    claimId: "claim-3",
  };

  const openUnmatched: InboxQueryItem = {
    status: "OPEN",
    deadlineAt: new Date("2026-11-08T12:00:00.000Z"),
    claimId: null,
  };

  const answeredQuery: InboxQueryItem = {
    status: "ANSWERED",
    deadlineAt: new Date("2026-11-08T04:00:00.000Z"),
    repliedAt: new Date("2026-11-08T03:30:00.000Z"),
    claimId: "claim-4",
  };

  it("handles 'open' filter", () => {
    expect(matchesFilter("open", openDueToday, now)).toBe(true);
    expect(matchesFilter("open", openOverdue, now)).toBe(true);
    expect(matchesFilter("open", answeredQuery, now)).toBe(false);
  });

  it("handles 'due-today' filter based on IST date", () => {
    expect(matchesFilter("due-today", openDueToday, now)).toBe(true);
    expect(matchesFilter("due-today", openOverdue, now)).toBe(true);
    expect(matchesFilter("due-today", openTomorrow, now)).toBe(false);
    expect(matchesFilter("due-today", answeredQuery, now)).toBe(false);
  });

  it("handles 'overdue' filter", () => {
    expect(matchesFilter("overdue", openOverdue, now)).toBe(true);
    expect(matchesFilter("overdue", openDueToday, now)).toBe(false);
    expect(matchesFilter("overdue", answeredQuery, now)).toBe(false);
  });

  it("handles 'unmatched' filter", () => {
    expect(matchesFilter("unmatched", openUnmatched, now)).toBe(true);
    expect(matchesFilter("unmatched", openDueToday, now)).toBe(false);
  });

  it("handles 'answered' filter", () => {
    expect(matchesFilter("answered", answeredQuery, now)).toBe(true);
    expect(matchesFilter("answered", openDueToday, now)).toBe(false);
  });
});

describe("compareForInbox", () => {
  it("sorts open queries before answered queries", () => {
    const open: InboxQueryItem = {
      status: "OPEN",
      deadlineAt: new Date("2026-11-09T10:00:00.000Z"),
      claimId: "c1",
    };
    const answered: InboxQueryItem = {
      status: "ANSWERED",
      deadlineAt: new Date("2026-11-07T10:00:00.000Z"),
      repliedAt: new Date("2026-11-07T09:00:00.000Z"),
      claimId: "c2",
    };

    expect(compareForInbox(open, answered)).toBeLessThan(0);
    expect(compareForInbox(answered, open)).toBeGreaterThan(0);
  });

  it("sorts open queries by soonest deadlineAt first (overdue items appear before future items)", () => {
    const overdue: InboxQueryItem = {
      status: "OPEN",
      deadlineAt: new Date("2026-11-08T05:00:00.000Z"),
      claimId: "c1",
    };
    const future: InboxQueryItem = {
      status: "OPEN",
      deadlineAt: new Date("2026-11-08T11:00:00.000Z"),
      claimId: "c2",
    };

    expect(compareForInbox(overdue, future)).toBeLessThan(0);
    expect(compareForInbox(future, overdue)).toBeGreaterThan(0);
  });

  it("sorts answered queries by repliedAt descending", () => {
    const newerReply: InboxQueryItem = {
      status: "ANSWERED",
      deadlineAt: new Date("2026-11-08T10:00:00.000Z"),
      repliedAt: new Date("2026-11-08T09:30:00.000Z"),
      claimId: "c1",
    };
    const olderReply: InboxQueryItem = {
      status: "ANSWERED",
      deadlineAt: new Date("2026-11-08T10:00:00.000Z"),
      repliedAt: new Date("2026-11-08T08:00:00.000Z"),
      claimId: "c2",
    };

    expect(compareForInbox(newerReply, olderReply)).toBeLessThan(0);
    expect(compareForInbox(olderReply, newerReply)).toBeGreaterThan(0);
  });
});
