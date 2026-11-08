# ClaimTrail

Cashless insurance claims and TPA query tracking workspace for hospital insurance desks.

## Overview

ClaimTrail centralizes cashless insurance workflows for multi-speciality hospital desks:

- **Checklist Rules Engine**: Payer and procedure-specific document matrices with scope inheritance.
- **AI Document Filing**: Multimodal Gemini document classification, quality checks, and patient name matching.
- **Pre-Authorization Gate**: Field extraction, validation, and merged submission packet generation.
- **TPA Query Inbox**: Inbound query triage, countdown timers, and structured reply drafting.
- **Settlement & Deductions**: Itemized deduction tracking with automatic reconciliation.
- **Metrics Dashboard & Compliance Audit**: Live IRDAI SLA monitoring and immutable audit logging.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4, Base UI
- **Database & ORM**: PostgreSQL 16, Prisma 7
- **Authentication**: Better Auth
- **AI Provider**: Google Gemini (`@google/genai`)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16
- Google Gemini API Key

### Installation

1. Clone the repository and install dependencies:

   ```bash
   pnpm install
   ```

2. Configure environment variables in `.env`:

   ```bash
   DATABASE_URL="postgresql://claimtrail:claimtrail@localhost:5432/claimtrail"
   GEMINI_API_KEY="your-gemini-api-key"
   BETTER_AUTH_SECRET="your-auth-secret"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

3. Run database migrations and seed data:

   ```bash
   pnpm prisma migrate deploy
   pnpm db:seed
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

## Verification & Testing

- **Unit tests**: `pnpm test`
- **Integration tests**: `pnpm test:int`
- **Typecheck**: `pnpm typecheck`
- **Lint**: `pnpm lint`
- **Build**: `pnpm build`
