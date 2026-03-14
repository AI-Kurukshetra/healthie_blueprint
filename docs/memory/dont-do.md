# Don't Do

<!-- Updated at each phase completion. Append new entries below. -->

## Pre-Planned Anti-Patterns

### Data Fetching
- Don't use `useEffect` for data fetching on page load — use Server Components
- Don't put Supabase queries directly in components — use `src/lib/queries/` or Server Actions
- Don't fetch data in layout.tsx that child pages also need — fetch at the page level

### Components
- Don't use `'use client'` on page components unless absolutely necessary
- Don't create components that both fetch data AND render UI — separate concerns
- Don't build a component that handles multiple roles inline — create role-specific variants

### Security
- Don't import `SUPABASE_SERVICE_ROLE_KEY` in any client component or `'use client'` file
- Don't skip RLS on any public table — even "read-only" tables need policies
- Don't skip Zod validation for "simple" forms — validate everything
- Don't trust client-side role checks alone — always enforce in RLS and Server Actions
- Don't commit `.env.local` or any file with secrets

### Styling
- Don't use inline styles — always Tailwind classes
- Don't use fixed pixel widths for layouts — use responsive Tailwind classes
- Don't install a UI package if shadcn/ui already has the component

### Architecture
- Don't build video consultation features — WebRTC is days of work
- Don't build real e-prescribing, insurance verification, or billing — mock these at most
- Don't build multi-tenancy — single organization is sufficient
- Don't add third-party API integrations — keep everything self-contained with Supabase

### Git
- Don't commit directly to main — always use phase branches
- Don't start a new phase before the current one is verified and merged

### Medical Context
- Don't display alarming empty states for medical data — use neutral, informational language
- Don't allow clinical notes to be deleted — only edited (medical records should be preserved)
- Don't skip confirmation dialogs on medical data modifications

## Discovered During Build

<!-- Codex appends new anti-patterns here -->

### Phase 1B
- Don’t rely only on client-side Supabase auth calls for core sign-in/sign-up flow.
- Don’t skip server-side Zod validation for auth payloads before calling Supabase.
- Don’t bypass middleware role checks with direct URL routing assumptions.

### Phase 1C
- Don’t put Radix dropdown/dialog components directly into provider server pages.
- Don’t duplicate status/note mutation logic across appointment list and detail routes.
- Don’t skip UUID validation for dynamic route params before querying protected records.

### Phase 1D
- Don’t gate the public landing page behind auth middleware redirects.
- Don’t introduce dashboard shell patterns (sidebar/header) into the marketing page.
- Don’t rely on unescaped punctuation in JSX copy when lint rules enforce escaped entities.

### Phase 2A
- Don’t leave role dashboards as static placeholders once CRUD data exists.
- Don’t compute dashboard KPIs in client components when server queries can provide canonical values.
- Don’t build mixed activity feeds with hardcoded samples; derive from real recent rows.

### Phase 3
- Don’t ship provider/admin data routes without route-level `loading.tsx` coverage.
- Don’t rely on only global `app/error.tsx` when route-group boundaries are expected.
- Don’t keep full desktop table columns visible on narrow screens when they reduce core action usability.

### Phase 1C (Patient)
- Don’t submit patient booking forms directly to Supabase from the client.
- Don’t let shared status components hardcode only one domain’s enums.
- Don’t ship appointment “View Details” links without a real detail route.

### Phase 2A (Patient Dashboard)
- Don’t compute patient stats in client components with `useEffect` on initial render.
- Don’t mix past and upcoming appointments in the “Next Appointment” card.
- Don’t count inactive records in health summary headline metrics.

### Phase 2B
- Don’t allow cross-role messaging without verifying a patient-provider relationship on the server.
- Don’t keep admin role changes purely client-side; enforce admin checks in server actions.
- Don’t split settings into separate role pages when one shared route can handle role-specific sections.

### Phase 3
- Don’t rely on HTML `required` alone for medical/product forms that already use Zod schemas.
- Don’t ship dense data tables without horizontal scroll handling at mobile breakpoints.
- Don’t skip route-group error boundaries for auth and dashboard surfaces.
