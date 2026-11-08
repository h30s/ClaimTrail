# 0002 · Four-tier checklist rule precedence

Date: 2026-11-08 · Status: accepted

## Context

Different insurance payers require different documents depending on the medical procedure being performed. The desk previously relied on memory and fragmented paper notes, leading to avoidable deduction losses.

## Decision

Implement a pure, hierarchical 4-tier rule resolution engine:

1. Payer + Procedure (most specific)
2. Payer only
3. Procedure only
4. Global fallback (least specific)

A narrower scope overrides wider scopes. "NOT_NEEDED" at a narrower scope allows a payer or procedure to waive a general requirement.

## Consequences

- Clean, deterministic rule resolution with zero database I/O in the engine.
- Desk heads can preview effective requirements and override specific requirements without code changes.
  − Desk heads must understand scope precedence when managing multi-level matrix rules.
