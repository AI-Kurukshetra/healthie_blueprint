---
name: rls-security
description: |
  Use when creating or debugging Row Level Security (RLS) policies, auth middleware,
  role enforcement, or input validation with Zod. Covers the 4 RLS policy patterns,
  role-based access, and security rules. Trigger on "RLS", "policy", "security",
  "permission", "role access". Do NOT use for UI or general Next.js tasks.
---

# RLS & Security — CareSync Conventions

## Rule #1: Every public table gets RLS enabled. No exceptions.

## 4 RLS Policy Patterns

### Pattern 1 — User Owns Row
```sql
-- User can only access their own rows
CREATE POLICY "users_own_data" ON public.profiles
  FOR ALL USING (auth.uid() = id);
```

### Pattern 2 — Public Read, Owner Write
```sql
-- Anyone authenticated can read, only owner can modify
CREATE POLICY "public_read" ON public.some_table
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "owner_write" ON public.some_table
  FOR ALL USING (auth.uid() = user_id);
```

### Pattern 3 — Workspace Access
```sql
-- Users in the same organization can access
CREATE POLICY "workspace_access" ON public.some_table
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships
      WHERE user_id = auth.uid()
    )
  );
```

### Pattern 4 — Role-Based Access (Primary for CareSync)
```sql
-- Different access levels per role
CREATE POLICY "role_based_select" ON public.appointments
  FOR SELECT USING (
    -- Patients see own appointments
    (auth.uid() = patient_id)
    OR
    -- Providers see their assigned appointments
    (auth.uid() = provider_id)
    OR
    -- Admins see all
    (EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ))
  );
```

## Per-Table Access Matrix

| Table | Patient | Provider | Admin |
|-------|---------|----------|-------|
| profiles | Own only | Own + assigned patients | All |
| appointments | Own | Assigned | All |
| clinical_notes | View own (no edit) | Create/edit own | View all |
| medical_records | Own | Assigned patients' | All |
| messages | Own sent/received | Own sent/received | All |
| provider_details | View assigned | Own | All |
| patient_details | Own | Assigned patients' | All |

## Auth Middleware

File: `web/src/middleware.ts`

Must do:
1. Create Supabase server client with cookie handling
2. Refresh auth token on every request (prevents expiry)
3. Redirect unauthenticated users from `/provider/*`, `/patient/*`, `/admin/*`
4. Redirect authenticated users away from `/login` and `/signup`
5. Optionally: verify role matches route prefix

```ts
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};
```

## Role Enforcement Layers

1. **Client-side** (cosmetic): Sidebar renders role-specific nav
2. **Server-side** (real security): RLS policies enforce data access
3. **Middleware** (UX): Redirects wrong-role route access
4. **Server Actions** (extra): Check role before operations where RLS alone isn't sufficient

## Input Validation with Zod

- One schema file per entity: `web/src/lib/validations/[entity].ts`
- Same schema validates client (react-hook-form) AND server (Server Action)
- Always validate in Server Actions even if the form already validates
- Sanitize: trim whitespace, enforce max lengths
- Dates: validate format, no appointments in the past

## Medical Data Security

- Clinical notes CANNOT be deleted — only edited
- All medical data tracks `created_at` and `updated_at`
- Patient data only visible to: the patient, assigned providers, admins
- No patient data on landing page or unauthenticated routes
- Confirmation dialogs before: cancelling appointments, editing notes, deleting records, changing roles

## Environment Variables

- Only `NEXT_PUBLIC_` prefixed vars in client code
- Never log environment variables
- `.env.local` is in `.gitignore` — never commit it
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — seed scripts and admin ops only
