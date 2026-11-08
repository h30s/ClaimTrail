# 0007 · Mobile review token for doctor sign-off

Date: 2026-11-08 · Status: accepted

## Context

Treating doctors in surgical and clinical wards need to review and approve pre-auth forms quickly between operations without logging into hospital enterprise desktops.

## Decision

Generate a cryptographically secure 24-hour review token (stored hashed with SHA-256 in PostgreSQL) accessible via mobile URL `/d/[token]`. Doctors view clinical pre-auth summaries, inspect attached documents via token-scoped routes, and tap Approve or Request Changes.

## Consequences

- Doctors can complete sign-off on mobile phones in under 30 seconds without hospital login hurdles.
- Review links expire automatically after 24 hours or after a decision is recorded.
  − Link distribution relies on hospital secure communication channels (e.g. WhatsApp or SMS).
