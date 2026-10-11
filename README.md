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

If account creation says `DATABASE_URL is missing at runtime` on Vercel, confirm the exact variable name `DATABASE_URL` is enabled for the deployment's environment (Production, Preview, or both), save it, and redeploy. Add the raw value without surrounding quotes. `DIRECT_URL` is for direct Prisma migrations and does not replace the runtime `DATABASE_URL`. If the message changes to a database connection error, verify the Supabase pooler host/port, password URL encoding, and that migrations have been applied.

### Password reset email

Password reset is available for accounts with an email address. Configure `RESEND_API_KEY`, `EMAIL_FROM` (a sender on a domain verified in Resend), and `NEXT_PUBLIC_APP_URL` in Vercel for the same environments as the deployed app. The reset link is random, stored only as a SHA-256 digest, expires after 30 minutes, is single-use, and is rate-limited per account. Unknown email addresses receive the same success response. Phone-only accounts need an email added to the account or support-assisted recovery. Redeploy after changing Vercel environment variables.

The Prisma schema uses PostgreSQL. `DATABASE_URL` is used by the application through Supabase's connection pool; Prisma migrations use `DIRECT_URL` to bypass the pool. For production on Vercel, configure both variables and `AUTH_SECRET` in the project environment settings. Use the Supabase migration workflow below for Supabase projects. The separate Prisma migrations (`npm run db:migrate` / `npm run db:migrate:dev`) are an alternative workflow; do not apply both migration systems to the same database. Do not commit database credentials.

## Supabase GitHub integration

The repository includes `supabase/config.toml` and SQL migrations under `supabase/migrations/`. In Supabase, connect this GitHub repository and set **Working directory** to `.` because the `supabase/` directory is at the repository root. Supabase Branching runs these migrations when it creates a preview branch.

> **Destructive reset:** The initial Supabase migration intentionally drops and recreates the app's known public tables (`User`, `Account`, `Session`, `VerificationToken`, `Doctor`, `DoctorSlot`, `Appointment`, and HMO tables) and their app enums. Existing rows in those tables will be permanently deleted. It does not drop unrelated public tables, Supabase Auth/Storage schemas, or project settings. Back up the database and confirm the target before applying it.

To apply the migration to an existing linked project with the Supabase CLI, first back up the database, then link the project and run `supabase db push` after reviewing the destructive SQL. This resets the DoctorCloser application tables and their data; Supabase Auth users, Storage objects, and unrelated public tables are not reset. Do not also apply the Prisma initial baseline to the same database; Supabase migrations and Prisma migrations maintain separate migration histories.

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
