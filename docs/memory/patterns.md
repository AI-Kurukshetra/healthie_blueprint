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
