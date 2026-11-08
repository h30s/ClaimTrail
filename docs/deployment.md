# ClaimTrail Deployment & Local Setup Guide

## System Requirements

- Node.js 22 or higher
- pnpm 9 or higher
- Docker (for local PostgreSQL 16)
- Google Gemini API Key (`GEMINI_API_KEY`)

---

## Local Development Setup

### 1. Clone & Install Dependencies

```bash
git clone <repository-url> claimtrail
cd claimtrail
pnpm install
```

### 2. Environment Configuration

Copy the template and verify variables:

```bash
cp .env.example .env
```

Ensure the following variables are defined in `.env`:

```bash
DATABASE_URL=postgresql://claimtrail:claimtrail@localhost:5432/claimtrail
DIRECT_URL=postgresql://claimtrail:claimtrail@localhost:5432/claimtrail
BETTER_AUTH_SECRET=your-secure-random-secret-at-least-32-chars
BETTER_AUTH_URL=http://localhost:3000
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash
STORAGE_DRIVER=local
DEMO_MODE=true
DEMO_PASSWORD=your-secure-demo-password
```

### 3. Database Startup & Seeding

```bash
pnpm db:up      # Starts PostgreSQL 16 container via Docker Compose
pnpm db:deploy  # Applies Prisma migrations
pnpm db:seed    # Populates catalog, users, rules, active claims & historical analytics
```

### 4. Start Development Server

```bash
pnpm dev        # Runs Next.js at http://localhost:3000
```

---

## Demo Accounts

With `DEMO_MODE=true`, the sign-in page (`/sign-in`) provides one-click credentials:

| Name           | Role      | Email                               | Scope                                |
| -------------- | --------- | ----------------------------------- | ------------------------------------ |
| Meera Kulkarni | Desk Head | `meera.kulkarni@claimtrail.example` | All claims, rules, payers, audit log |
| Arjun Patil    | Executive | `arjun.patil@claimtrail.example`    | Assigned claims only                 |
| Sneha Joshi    | Executive | `sneha.joshi@claimtrail.example`    | Assigned claims only                 |

---

## Test Suites & Verification

```bash
pnpm typecheck    # Strict TypeScript checks
pnpm lint         # Next.js and ESLint code standards
pnpm test         # Pure domain unit tests (Vitest)
pnpm test:int     # Database and workflow integration tests (Vitest + Postgres)
pnpm eval:ai      # Live Gemini multimodal document classification evaluation
```

---

## Production Deployment (Mumbai Region)

### 1. Database & Storage (Supabase Mumbai `ap-south-1`)

1. Create a Supabase project in `ap-south-1` (Mumbai).
2. Set `DATABASE_URL` to the pooled connection string (port 6543) and `DIRECT_URL` to the direct connection (port 5432).
3. Create a **private** storage bucket named `claim-documents`.
4. Retrieve the `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

### 2. Migrations & Seeding Production

```bash
pnpm prisma migrate deploy
pnpm prisma db seed
```

### 3. Serverless Deployment (Vercel Mumbai `bom1`)

1. Connect the GitHub repository to Vercel.
2. `vercel.json` automatically pins serverless functions to the Mumbai region (`bom1`):

```json
{
  "regions": ["bom1"]
}
```

3. Set production environment variables:
   - `DATABASE_URL`, `DIRECT_URL`
   - `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
   - `GEMINI_API_KEY`, `GEMINI_MODEL`
   - `STORAGE_DRIVER=supabase`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`
   - `DEMO_MODE=true`, `DEMO_PASSWORD`
