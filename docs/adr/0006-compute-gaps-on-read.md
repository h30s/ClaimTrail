# 0006 · Compute checklist gaps on read

Date: 2026-11-08 · Status: accepted

## Context

When displaying the claim file, worklist attention items, or submission readiness, the system must evaluate whether required documents are missing, stale, or patient-mismatched.

## Decision

Compute checklist satisfaction and gaps dynamically on read via pure domain functions (`resolveChecklist`, `computeGaps`, `buildClaimInsight`) rather than maintaining denormalized database counters or cache columns.

## Consequences

- Single source of truth. Checklist rule edits immediately reflect on open claims with zero bulk update migrations.
- Eliminates cache invalidation bugs and race conditions.
  − Slightly higher CPU execution per read, which benchmarks at under 2ms for 150 active claims.
