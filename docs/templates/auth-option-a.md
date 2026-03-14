# Auth Option A — Profile Trigger Pattern

## Overview
A PostgreSQL trigger fires on every new `auth.users` row and auto-creates a matching `public.profiles` row. This guarantees a profile always exists for every user.

## Implementation
The trigger is included in `docs/templates/schema.sql`. It runs automatically — no application code needed for profile creation.

## Flow
1. User signs up via Supabase Auth (email/password)
2. `auth.users` row created
3. Trigger fires → `profiles` row created with `id`, `email`, `full_name` (from user_metadata)
4. `role` is NULL initially
5. User redirected to `/onboarding`
6. Onboarding page updates `profiles.role` via Server Action
7. User redirected to role-specific dashboard

## Onboarding Check
In `src/app/(dashboard)/layout.tsx`:
```ts
const supabase = await createServerClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) redirect('/login');

const { data: profile } = await supabase
  .from('profiles')
  .select('role, full_name')
  .eq('id', user.id)
  .single();

if (!profile?.role) redirect('/onboarding');
```

## Signup Form
Pass `full_name` in user_metadata so the trigger can capture it:
```ts
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: fullName },
  },
});
```
