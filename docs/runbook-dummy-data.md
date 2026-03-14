# Dummy Data Runbook

This project uses demo users and seeded records for judging and manual QA.

## Scope of Seed Data

The seed creates testable data across:
- Auth users and role profiles (`provider`, `patient`, `admin`)
- Provider details and patient details
- Appointments (mixed statuses and types)
- Clinical notes (SOAP)
- Medical records (conditions, medications, allergies)
- Provider availability

## Seed Data (Add / Refresh)

From repo root:

```bash
set -a
source web/.env.local
set +a
npx tsx scripts/seed.ts
```

Notes:
- `scripts/seed.ts` reads `.env.local` at repo root, so exporting `web/.env.local` first is required when root env is blank.
- This script is additive for appointments/notes/records/availability, so repeated runs can increase volume.

## Remove Demo Data (Full Rollback)

From repo root:

```bash
set -a
source web/.env.local
set +a
npx tsx scripts/seed-cleanup.ts
```

What cleanup removes:
- All users with email ending `@caresync.demo` from `auth.users`
- Related rows from: `profiles`, `provider_details`, `patient_details`, `appointments`, `clinical_notes`, `medical_records`, `messages`, `availability`

## Suggested Reset Workflow

For a clean demo reset:

```bash
set -a
source web/.env.local
set +a
npx tsx scripts/seed-cleanup.ts
npx tsx scripts/seed.ts
```

## Demo Accounts After Seeding

- Provider: `provider@caresync.demo` / `Demo1234!`
- Patient: `patient@caresync.demo` / `Demo1234!`
- Admin: `admin@caresync.demo` / `Demo1234!`
