# DoctorCloser

DoctorCloser is a Next.js appointment discovery and booking app for clinics and patients in Nigeria. The public landing page, doctor search, and sample profiles work without a database, so the app can be deployed to Vercel before connecting a database.

## Requirements

- Node.js 20 or newer
- npm

## Run without a database

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The app uses sample Port Harcourt doctor listings in demo mode. Account creation, sign-in, and saving or managing appointments require a configured database; the app explains this on the relevant screens rather than crashing.

## Enable accounts and appointments

Set `DATABASE_URL` to your Supabase **pooler** connection string (port `6543`, with `pgbouncer=true&connection_limit=1`), `DIRECT_URL` to the direct database connection (port `5432`), and `AUTH_SECRET` to a long, random secret. Copy `.env.example` to `.env` and replace its placeholders. For local development, create/update the tables and sample data:

```bash
npm run db:migrate:dev
npm run db:seed
npm run dev
```

The Prisma schema uses PostgreSQL. `DATABASE_URL` is used by the application through Supabase's connection pool; Prisma migrations use `DIRECT_URL` to bypass the pool. For production on Vercel, configure both variables and `AUTH_SECRET` in the project environment settings. On a new database, apply the migrations with `npx prisma migrate deploy`. If the existing Supabase database already has the original DoctorCloser tables but has no Prisma migration history, baseline that existing schema first with `npx prisma migrate resolve --applied 20261011190000_init`, then run `npx prisma migrate deploy` to apply the HMO migration. Confirm the existing tables match the checked-in initial schema before baselining. Do not commit database credentials.

## HMO verification API

Both HMO routes require an authenticated session and a configured database. Provision trusted `HmoProvider` and patient-owned `HmoPolicy` records before use; do not treat a client-supplied policy number as proof of coverage. Responses are marked `private, no-store` because they can contain insurance and health information.

- `POST /api/hmo/verify` with `{ "policyNumber": "...", "providerId": "..." }` verifies a policy belonging to the signed-in user. It reports the local policy-record result; it does not claim a live insurer lookup.
- `POST /api/hmo/auth-request` with `{ "appointmentId": "...", "diagnosisSummary": "...", "hmoPolicyId": "..." }` queues a pending pre-authorization request for the signed-in user's appointment. `hmoPolicyId` can be omitted when the appointment is already linked to a policy.

HMO provider verification and authorization endpoints are stored for provider configuration, but external insurer protocols vary. The current implementation uses the Supabase policy record and persists requests in a pending queue; wire an insurer-specific adapter before representing either as a live HMO decision. Diagnosis summaries are sensitive health data and should be protected by your applicable access, retention, and audit controls.

## Deploy to Vercel

Import the repository in Vercel and use the Next.js framework preset. The included `vercel.json` selects `.next` as the build output, so a stale `public` output-directory setting does not prevent deployment. No database environment variables are required to build or serve the public demo. Configure a PostgreSQL database and `AUTH_SECRET` to enable account and booking features.

## Useful commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:migrate
npm run db:migrate:dev
npm run db:seed
```

The seed script creates a demo account (`patient@example.com`, `password123`) for local database-backed development.
