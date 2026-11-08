# 0005 · Mumbai hosting and live Gemini AI integration

Date: 2026-11-08 · Status: accepted

## Context

Indian healthcare applications handling patient identifiable data must minimize latency and comply with data residency standards. AI features require multimodal visual understanding of handwritten and scanned clinical records.

## Decision

Host web application on Vercel with serverless functions pinned to Mumbai (`bom1`). Host Postgres database and private file storage in Supabase Mumbai (`ap-south-1`). Integrate Google Gemini (`gemini-2.5-flash` / `gemini-2.5-pro`) directly via `@google/genai` for document and query understanding. Zero mock providers.

## Consequences

- Sub-100ms response times for database and API calls within Maharashtra.
- State-of-the-art multimodal vision parsing for Indian medical documents and lab reports.
  − Gemini API calls require internet outbound access and an active API key.
