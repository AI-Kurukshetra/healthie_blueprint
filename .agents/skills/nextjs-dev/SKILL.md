---
name: nextjs-dev
description: |
  Use for Next.js 15 App Router development tasks: creating pages, layouts, routes,
  Server Components, Client Components, Server Actions, middleware, and API routes.
  Do NOT use for database queries, Supabase operations, or UI component styling.
---

# Next.js 15 App Router — CareSync Conventions

## Project Structure

The app lives in `web/src/` with this layout:

```
web/src/app/
├── (auth)/           # Login, signup, onboarding
├── (dashboard)/      # Protected routes — provider, patient, admin views
├── api/              # API routes (webhooks, external integrations only)
├── layout.tsx        # Root layout
├── page.tsx          # Public landing page
├── error.tsx         # Global error boundary
├── loading.tsx       # Global loading
└── not-found.tsx     # Global 404
```

## Server vs Client Components

- **Default to Server Components.** Only add `'use client'` when the component needs interactivity (onClick, useState, useEffect, browser APIs).
- **Page components are always Server Components.** Extract interactive parts into small client components.
- **Data fetching happens in Server Components only.** Never `useEffect` + `fetch` for initial data loads.
- **Forms are Client Components** (need `react-hook-form`), but the Server Action they call runs on the server.

## Server Action Pattern

```ts
// web/src/app/(dashboard)/provider/appointments/actions.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createAppointmentSchema } from '@/lib/validations/appointment';

export async function createAppointment(formData: FormData) {
  const supabase = await createServerClient();
  const parsed = createAppointmentSchema.safeParse({
    patient_id: formData.get('patient_id'),
    date_time: formData.get('date_time'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert(parsed.data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath('/provider/appointments');
  return { success: true, data };
}
```

## Return Type for All Server Actions

```ts
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
```

- Wrap every Server Action in try/catch
- Never throw from Server Actions — return the error shape
- Always call `revalidatePath()` after mutations

## Route Error Boundaries

Every route group MUST have `error.tsx` + `loading.tsx`. Dynamic `[id]` routes also need `not-found.tsx`.

## Middleware

File: `web/src/middleware.ts`

1. Create Supabase server client with cookie handling
2. Refresh auth token on every request
3. Redirect unauthenticated users from protected routes
4. Redirect authenticated users away from `/login` and `/signup`

## File Naming

- Components: `PascalCase.tsx`
- Utilities/hooks: `camelCase.ts`
- Route files: Next.js conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`)
- Validation schemas: `camelCase.ts` in `web/src/lib/validations/`

## Import Order

1. React / Next.js
2. Third-party libraries
3. Internal components (`@/components/...`)
4. Internal utilities (`@/lib/...`)
5. Types (`@/types/...`)

## Rules

- Use `revalidatePath()` after every mutation
- Use `.select()` after `.insert()` and `.update()`
- Use `.single()` when expecting one row
- Use relationship queries to avoid N+1
- Never fetch data in `layout.tsx` that child pages also need
- Package manager: `npm` (not yarn, not pnpm)
