---
name: supabase-db
description: |
  Use for Supabase database operations: writing SQL migrations, creating tables,
  defining RLS policies, managing auth triggers, generating TypeScript types,
  and configuring Supabase clients. Do NOT use for UI components or Next.js routing.
---

# Supabase Database — CareSync Conventions

## Client Setup

### Server Client (Server Components, Server Actions, Route Handlers)
```ts
// web/src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
```

### Browser Client (Client Components only)
```ts
// web/src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
```

## Core Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User identity — id, email, full_name, role, avatar_url, phone, date_of_birth |
| `provider_details` | Provider specialization, license, bio |
| `patient_details` | Blood type, emergency contact, insurance |
| `appointments` | Core entity — patient_id, provider_id, date_time, duration, status, type |
| `clinical_notes` | SOAP notes — appointment_id, subjective, objective, assessment, plan |
| `medical_records` | Patient records — type, name, details, status |
| `messages` | Tier 2 — sender_id, receiver_id, content |
| `availability` | Provider schedule — day_of_week, start/end time |

## Auth Trigger (Profile Auto-Creation)

Using Option A — database trigger creates a `profiles` row on every new auth signup:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Query Patterns

### Fetching with Relationships
```ts
const { data } = await supabase
  .from('appointments')
  .select('*, patient:profiles!patient_id(*), provider:profiles!provider_id(*)')
  .order('date_time', { ascending: true });
```

### Insert + Return
```ts
const { data, error } = await supabase
  .from('appointments')
  .insert(parsed.data)
  .select()
  .single();
```

## Type Generation

```bash
npx supabase gen types typescript --project-id cxpuroevrgspzsexsyug > web/src/types/database.ts
```

Helper types:
```ts
type Profile = Database['public']['Tables']['profiles']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];
```

## Environment Variables

```
# Public (safe for client)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-only (NEVER in client code)
SUPABASE_SERVICE_ROLE_KEY=
```

## Rules

- Always handle the Supabase `error` return — never assume success
- Use `.select()` after `.insert()` and `.update()` to return the row
- Use `.single()` when expecting exactly one row
- Use relationship queries to avoid N+1
- Never import `SUPABASE_SERVICE_ROLE_KEY` in client code
- Service role key bypasses RLS — only use in seed scripts and admin ops
- RLS must be enabled on every public table — no exceptions
