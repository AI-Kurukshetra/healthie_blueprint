---
name: seed-data
description: |
  Use when creating, running, or debugging the database seed script. Covers demo
  user creation, realistic medical data generation, and seed script patterns.
  Trigger on "seed", "demo data", "test data", "demo users". Do NOT use for
  production data or migrations.
---

# Seed Data — CareSync Conventions

## Overview

Standalone Node script at `scripts/seed.ts` that populates the database with realistic demo data for development and judging demos.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Provider | provider@caresync.demo | Demo1234! |
| Patient | patient@caresync.demo | Demo1234! |
| Admin | admin@caresync.demo | Demo1234! |

## Data Volume

Scale to make the product feel real:
- ~3 providers (different specializations)
- ~12 patients (varied demographics)
- ~25 appointments (past, today, upcoming — mixed statuses)
- ~15 clinical notes (SOAP format, mix of draft/signed)
- ~8 medical records per patient

## Seed Script Pattern

```ts
// scripts/seed.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Bypasses RLS for seeding
);

async function seed() {
  // 1. Create auth users via admin API
  // 2. Profiles auto-created by trigger
  // 3. Insert provider_details and patient_details
  // 4. Insert appointments (varied statuses and dates)
  // 5. Insert clinical notes (SOAP format)
  // 6. Insert medical records
}

seed().catch(console.error);
```

## Data Realism Rules

- Names: Use realistic but clearly fictional names (not "Test User 1")
- Dates: Spread appointments across past 30 days + next 14 days
- Statuses: Mix of scheduled, completed, cancelled, no-show
- Clinical notes: Varied chief complaints and realistic SOAP content
- Times: Appointments during business hours (9am-5pm), varied durations (15/30/60 min)
- Provider specializations: Family Medicine, Internal Medicine, Psychiatry

## Running the Seed Script

```bash
cd web && npx tsx ../scripts/seed.ts
```

Or add to package.json:
```json
"scripts": {
  "seed": "tsx ../scripts/seed.ts"
}
```

## Rules

- Always use `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
- Create auth users via `supabase.auth.admin.createUser()`
- Profiles are auto-created by the database trigger — don't insert manually
- Use `upsert` where possible to make the script idempotent
- Log progress: "Created 3 providers... Created 12 patients..."
- Handle errors gracefully — if a user already exists, skip and continue
