# Patterns That Work

<!-- Updated at each phase completion. Append new entries below. -->

## Pre-Planned Patterns

### Server Action Pattern
```
- File: src/app/(dashboard)/[role]/[feature]/actions.ts
- Return: { success: true, data } or { success: false, error: string }
- Always call revalidatePath() after mutations
- Validate with Zod before any database operation
- Wrap in try/catch — never throw from Server Actions
```

### Supabase Server Client Pattern
```
- File: src/lib/supabase/server.ts
- Uses createServerClient from @supabase/ssr
- Passes cookies() for auth session
- Used in Server Components, Server Actions, Route Handlers
```

### Supabase Browser Client Pattern
```
- File: src/lib/supabase/client.ts
- Uses createBrowserClient from @supabase/ssr
- Used in Client Components only
```

### Role-Based Navigation Pattern
```
- File: src/config/nav.ts
- Export navItems object keyed by role: { patient: [...], provider: [...], admin: [...] }
- Each item: { label, href, icon }
- Sidebar component reads user role from profile and renders appropriate nav
```

### List Page Pattern
```
- Server Component fetches data
- Header with title + "Create New" button
- Search input + filter controls (Tier 2)
- Data table or card grid
- Empty state component when array is empty (icon + message + CTA)
- Skeleton loader in loading.tsx matching table/card layout
```

### Detail/Edit Page Pattern
```
- Back button + page title
- Server Component fetches item by ID
- not-found.tsx if item doesn't exist
- Form with react-hook-form + zodResolver
- Save + Cancel buttons
- Confirmation dialog before destructive actions
```

### Dashboard Page Pattern
```
- Greeting: "Welcome back, {name}"
- 3-4 stat cards (total counts, today's count, recent activity)
- Recent items list or table
- Role-specific content (provider sees patients, patient sees appointments)
```

### Empty State Pattern
```
- Lucide icon (contextual: CalendarX for no appointments, Users for no patients)
- Heading: "No {items} yet"
- Description: brief helpful text
- CTA button: "Create your first {item}" or "Book an appointment"
```

### SOAP Clinical Note Pattern
```
- Four text fields: Subjective, Objective, Assessment, Plan
- Each is a textarea with label
- Linked to an appointment (appointment_id)
- Only the authoring provider can edit
- Patients can view but not edit
```

## Discovered During Build

<!-- Codex appends new patterns here -->

### Auth Server Action Pattern
```
- File: src/app/(auth)/actions.ts
- Validate `LoginInput`/`SignupInput` with shared Zod schemas server-side.
- Return `{ success, error?, redirectTo? }` to client forms for UX messaging + navigation.
```

### Onboarding Role Assignment Pattern
```
- File: src/app/(auth)/onboarding/actions.ts
- Validate role enum, update `profiles.role`, redirect to role-specific dashboard.
- Keep redirect logic in one action to avoid duplicating role routing in UI components.
```

### Provider List + Actions Pattern
```
- Server page fetches provider-scoped rows with joins and renders table.
- Row-level interactivity (dropdown actions) lives in a small client component.
- Status changes call a shared server action and revalidate list/detail paths.
```

### Appointment Detail SOAP Pattern
```
- File: src/components/provider/ClinicalNoteEditor.tsx
- Read mode for existing note, edit mode for form, server-action submit for create/update.
- Require confirmation before updating existing notes to reduce accidental edits.
```

### Landing Page Section Pattern
```
- File: src/app/page.tsx
- Compose hero, features, steps, trust, CTA, and footer as separate section blocks.
- Use static arrays for feature/step/tech items and map into cards for clean maintenance.
```

### Dashboard Metrics Pattern
```
- Fetch stat counts with head+count queries in parallel via Promise.all.
- Fetch recent lists (appointments/notes/signups) with small limits for quick dashboard loads.
- Compute derived KPIs (for example pending notes) from server-side row sets before render.
```

### Segment Error Boundary Pattern
```
- Keep `src/app/error.tsx` for global fallback and add group-level `error.tsx` for `(auth)` and `(dashboard)`.
- Group-level boundaries should provide direct retry and minimal navigation escape actions.
```

### Mobile Table Prioritization Pattern
```
- Keep essential columns visible on mobile (name, status, actions).
- Hide secondary columns (`email`, `phone`, `created_at`) with `hidden sm:table-cell`/`hidden md:table-cell`.
```

### Patient Booking Flow Pattern
```
- Files: src/app/(dashboard)/patient/appointments/new/page.tsx + actions.ts
- Server page fetches providers; client form handles selection/date/type UX.
- Server action validates with shared `createAppointmentSchema`, inserts, then revalidates list route.
```

### Patient Records Section Pattern
```
- File: src/app/(dashboard)/patient/records/page.tsx
- Query once, split into conditions/medications/allergies sections in server component.
- Use shared `StatusBadge` + per-section empty state for neutral medical UX.
```

### Patient Dashboard Stats Pattern
```
- File: src/app/(dashboard)/patient/dashboard/page.tsx
- Fetch appointment/medical-record counts in parallel with head-count queries.
- Pair top-line StatCards with a prominent next-appointment card and recent-completed list.
```

### Provider Name Resolution Pattern
```
- Collect provider IDs from next/recent appointment rows and fetch profile names once.
- Map IDs to display names in-memory for dashboard cards/lists.
- Avoid repeated per-row profile queries in Server Components.
```

### Conversation Thread Pattern
```
- Files: src/app/(dashboard)/patient/messages/page.tsx, provider/messages/page.tsx, components/shared/MessageThread.tsx
- Server page builds conversation list + thread data; client thread handles send + refresh UX.
- Message sends go through validated server action and trigger route revalidation + toast feedback.
```

### Provider Availability Pattern
```
- Files: src/app/(dashboard)/provider/schedule/page.tsx + actions.ts, components/provider/ProviderScheduleForm.tsx
- Server page loads schedule defaults/current rows; client form edits weekday hours and active toggles.
- Save action validates full schedule with Zod, rewrites provider availability, and revalidates booking routes.
```

### Shared Settings Pattern
```
- Files: src/app/(dashboard)/settings/page.tsx + actions.ts, components/shared/SettingsForms.tsx
- One settings route loads profile and role-specific details; client forms submit to role-aware server actions.
- Profile/password/detail updates all return structured success/error for consistent toast handling.
```

### CSV Export Route Pattern
```
- Files: src/app/(dashboard)/provider/patients/export/route.ts, admin/users/export/route.ts
- Route handlers verify authenticated role, query scoped rows, and return `text/csv` with attachment headers.
- Escape CSV fields centrally to handle commas/quotes/newlines safely.
```

### Route-Group Error Boundary Pattern
```
- Files: src/app/(auth)/error.tsx and src/app/(dashboard)/error.tsx
- Use client error boundaries with retry CTA for isolated recovery in each major app surface.
- Keeps auth/dashboard failures from collapsing the entire app shell.
```
