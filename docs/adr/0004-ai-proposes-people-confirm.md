# 0004 · AI proposes, people confirm with review tray

Date: 2026-11-08 · Status: accepted

## Context

Automating medical document filing and query summarization carries risk if errors directly alter legal or medical claims without human oversight.

## Decision

All AI inferences (Gemini multimodal classification and query parsing) follow the principle: "the model proposes, a human confirms, and every proposal carries verifiable evidence."

- Documents with confidence >= 0.80 and known type auto-file into slots.
- Anything below 0.80, illegible, or non-medical routes to a "Needs sorting" review tray with reason badges.
- Pre-auth fields extracted by AI are suggestions with source quotes; a human clicks "Confirm" on each.

## Consequences

- High classification accuracy while preventing misfiled documents or incorrect legal data.
- Zero unverified submissions leaving the hospital.
  − Requires human action to confirm extracted suggestions and triage review tray items.
