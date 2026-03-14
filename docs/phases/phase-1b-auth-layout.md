# Phase 1B — Auth + Layout (~60 min)

## Goal
Implement authentication (signup, login, logout), role-based onboarding, and the sidebar dashboard layout shell. After this phase, users can sign up, pick a role, and see an empty dashboard with navigation.

## Database Prerequisite
Ensure the schema from docs/templates/schema.sql has been run in Supabase, including:
- `profiles` table with `role` column
- `handle_new_user()` trigger function
- RLS policies on `profiles`

Also configure in Supabase Dashboard:
- Authentication → URL Configuration → Set Site URL to your Vercel URL
- Authentication → URL Configuration → Add `http://localhost:3000` to Redirect URLs
- Authentication → URL Configuration → Add your Vercel URL to Redirect URLs

## Steps

### 1. Auth Pages

**src/app/(auth)/login/page.tsx**
- Server Component wrapper, Client Component form inside
- Fields: email, password
- "Don't have an account? Sign up" link
- On success: redirect to dashboard (middleware handles role routing)
- Use Zod schema: `loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) })`

**src/app/(auth)/signup/page.tsx**
- Fields: full name, email, password, confirm password
- On success: redirect to `/onboarding`
- Use Zod schema with password confirmation match

**src/app/(auth)/layout.tsx**
- Centered card layout, no sidebar
- CareSync logo/name at top
- Clean, minimal design — professional healthcare feel

### 2. Onboarding Page

**src/app/(auth)/onboarding/page.tsx**
- Shows after first signup (check if `profiles.role` is null)
- "Welcome to CareSync" heading
- Role selection: 3 cards — Patient, Provider, Admin
- Each card: icon + title + short description
  - Patient: "Book appointments and manage your health" (icon: Heart)
  - Provider: "Manage patients and clinical documentation" (icon: Stethoscope)
  - Admin: "Manage platform users and settings" (icon: Shield)
- On selection: update `profiles.role` via Server Action, redirect to role-specific dashboard

**Server Action for onboarding:**
```ts
// src/app/(auth)/onboarding/actions.ts
'use server';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function setUserRole(role: 'patient' | 'provider' | 'admin') {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  await supabase.from('profiles').update({ role }).eq('id', user.id);

  if (role === 'provider') redirect('/provider/dashboard');
  if (role === 'patient') redirect('/patient/dashboard');
  if (role === 'admin') redirect('/admin/dashboard');
}
```

### 3. Role-Based Navigation Config

**src/config/nav.ts**
```ts
import {
  LayoutDashboard, Calendar, Users, FileText, ClipboardList,
  MessageSquare, Settings, Stethoscope, Heart, Activity, Shield
} from 'lucide-react';

export const navConfig = {
  patient: [
    { label: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'Appointments', href: '/patient/appointments', icon: Calendar },
    { label: 'Health Records', href: '/patient/records', icon: FileText },
    { label: 'Messages', href: '/patient/messages', icon: MessageSquare },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  provider: [
    { label: 'Dashboard', href: '/provider/dashboard', icon: LayoutDashboard },
    { label: 'Patients', href: '/provider/patients', icon: Users },
    { label: 'Appointments', href: '/provider/appointments', icon: Calendar },
    { label: 'Clinical Notes', href: '/provider/notes', icon: ClipboardList },
    { label: 'Schedule', href: '/provider/schedule', icon: Activity },
    { label: 'Settings', href: '/settings', icon: Settings },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Settings', href: '/admin/settings', icon: Shield },
  ],
};
```

### 4. Sidebar Layout

Reference: docs/templates/layout-sidebar.md for the full component spec.

**src/components/layout/Sidebar.tsx** — Client component
- Reads user profile (role, name, avatar) from context or props
- Renders nav items from `navConfig[role]`
- CareSync logo at top
- User avatar + name + role badge at bottom
- Logout button
- Collapsible on mobile (Sheet component)

**src/components/layout/Header.tsx**
- Mobile menu trigger (hamburger)
- Page title / breadcrumb area
- User avatar dropdown (profile, settings, logout)

**src/app/(dashboard)/layout.tsx** — Server Component
- Fetches current user profile (role, name)
- If no role set → redirect to `/onboarding`
- Renders Sidebar + Header + `{children}` in main content area
- Passes role and profile data to layout components

### 5. Dashboard Route Handler

**src/app/(dashboard)/page.tsx**
- Reads user role from profile
- Redirects to role-specific dashboard:
  - `patient` → `/patient/dashboard`
  - `provider` → `/provider/dashboard`
  - `admin` → `/admin/dashboard`

### 6. Placeholder Dashboard Pages
Create minimal placeholder pages for each role's dashboard:
- `src/app/(dashboard)/provider/dashboard/page.tsx` — "Provider Dashboard — Coming Soon"
- `src/app/(dashboard)/patient/dashboard/page.tsx` — "Patient Dashboard — Coming Soon"
- `src/app/(dashboard)/admin/dashboard/page.tsx` — "Admin Dashboard — Coming Soon"

Each should have their `loading.tsx` with skeletons.

### 7. Logout Action
```ts
// src/app/(auth)/actions.ts
'use server';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}
```

## Verification Checklist
- [ ] Can sign up with email/password → arrives at onboarding
- [ ] Onboarding shows 3 role cards, selecting one updates profile and redirects
- [ ] Sidebar shows correct nav items for each role
- [ ] Sidebar collapses to hamburger on mobile
- [ ] Logout works and redirects to login
- [ ] Unauthenticated users redirected from dashboard routes
- [ ] Authenticated users redirected from login/signup pages
- [ ] `npm run build` passes

## Deploy Checkpoint: NO — auth alone isn't meaningful to deploy
