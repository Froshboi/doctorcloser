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

Set `DATABASE_URL` to a SQLite or PostgreSQL connection string and set `AUTH_SECRET` to a long, random secret. Copy `.env.example` to `.env` for local development, then create the tables and sample data:

```bash
npm run db:push
npm run db:seed
npm run dev
```

For production on Vercel, configure a persistent hosted PostgreSQL database and add `DATABASE_URL` and `AUTH_SECRET` in the project environment settings. The database is optional for building and browsing the public demo, but required to persist accounts and appointments. Do not use an ephemeral SQLite filesystem for Vercel production data.

## Deploy to Vercel

Import the repository in Vercel and use the Next.js framework preset. The included `vercel.json` selects `.next` as the build output, so a stale `public` output-directory setting does not prevent deployment. No database environment variables are required to build or serve the public demo. Configure a PostgreSQL database and `AUTH_SECRET` to enable account and booking features.

## Useful commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:push
npm run db:seed
```

The seed script creates a demo account (`patient@example.com`, `password123`) for local database-backed development.
