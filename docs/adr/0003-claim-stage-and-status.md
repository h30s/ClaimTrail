# 0003 · Claim state as stage times status

Date: 2026-11-08 · Status: accepted

## Context

A cashless claim progresses through distinct operational stages (Pre-Auth, Enhancement, Discharge). At each stage, the claim can be in Draft, Sent, Query, Approved, or Rejected status. Queries can arrive in any stage.

## Decision

Represent claim lifecycle as two orthogonal enums: `stage` (`PREAUTH`, `ENHANCEMENT`, `DISCHARGE`) and `status` (`DRAFT`, `SENT`, `QUERY`, `APPROVED`, `REJECTED`, `SETTLED`). An append-only `ClaimEvent` audit table records every transition with before-and-after states.

## Consequences

- Clean status-machine matrix handling "Query during Enhancement" or "Draft at Discharge".
- Hospital vs Insurer ball-in-court clocks are derived purely from the event timeline without extra clock tables.
  − Display badges must compose stage and status into human-readable text.
