# 0001 · Modular monolith on Next.js 16

Date: 2026-11-08 · Status: accepted

## Context

Company A's insurance desk has 9 users in a 180-bed hospital in Nashik. We needed high velocity, unified TypeScript type safety between server and client, and zero operational overhead of maintaining a separate API gateway or microservices.

## Decision

Build ClaimTrail as a modular monolith in Next.js 16 App Router using React Server Components for reads, Server Actions for writes, and strict feature-first layering (`domain/` -> `server/` -> `components/`).

## Consequences

- Instant end-to-end type safety from database schemas through domain models to UI components.
- Zero CORS, zero microservice network latency, and simple single-target deployment to Vercel.
  − Requires discipline to enforce layer boundaries and prevent database access from leaking into UI components.
