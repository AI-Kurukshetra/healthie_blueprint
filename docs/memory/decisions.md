# Decisions

<!-- Updated at each phase completion. Format: Phase/Context, Decision, Reason -->
<!-- Append new entries below. Never overwrite existing entries. -->

## Pre-Planned Decisions

### Architecture
- **Framework**: Next.js 15 with App Router, TypeScript strict mode, `src/` directory
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **UI**: shadcn/ui + Tailwind CSS, professional theme (slate/zinc base, blue accent)
- **Layout**: Sidebar dashboard layout for all roles
- **Package manager**: npm
- **Supabase client**: `@supabase/ssr` — server client + browser client + middleware client

### Auth & Roles
- **Auth pattern**: Option A — profile trigger (auto-create profiles row on signup)
- **Three roles**: patient, provider, admin — stored in `profiles.role`
- **Primary auth**: Email/password
- **Stretch auth**: Google OAuth (Tier 3 only)
- **Onboarding**: Post-signup screen for role selection + name entry
- **Middleware**: Refresh session on every request, redirect unauthenticated users, redirect authenticated users from auth pages

### Scope
- **Core entity**: Appointments (connects patients and providers)
- **Tier 1**: Auth + roles, provider dashboard, patient portal, appointment scheduling, clinical notes (SOAP), seed data, landing page
- **Tier 2**: Dashboard stats/charts, patient search/filter, secure messaging, medical history CRUD, settings
- **Tier 3**: Responsive polish, prescription management (simplified), skeletons/empty states/validation, dark mode (stretch)
- **Not building**: Video consultations, e-prescribing, insurance/billing/claims, lab integration, mobile apps, FHIR, AI/ML, multi-tenant

### Security
- **RLS**: Enabled on every public table. 4 patterns templated (user-owns, public-read, workspace, role-based)
- **Validation**: Full Zod — shared schemas for client + server
- **Env vars**: Never expose service role key in client code

### UI/UX
- **Theme**: Professional (slate/zinc + blue accent)
- **Dark mode**: Tier 3 stretch goal
- **Non-negotiable polish**: Skeleton loaders, empty states with CTAs, inline form validation errors
- **Toasts**: Tier 2 nice-to-have

### Seed Data
- **Approach**: Standalone Node script (`scripts/seed.ts`)
- **Credentials**: To be decided (demo provider + demo patient + demo admin)
- **Volume**: Scaled to product — ~3 providers, 12 patients, 25 appointments, 15 clinical notes

### Deployment
- **Vercel**: Auto-deploy on push to main
- **Branching**: Phase branches merged to main after verification
- **First deploy**: Within first 30 minutes (empty scaffold)

### Git
- **Branches**: `phase/{id}-{description}`, never commit directly to main
- **Commits**: Auto by Codex, format `phase-{id}: {description}`
- **Merge**: After local verification of each phase

### Video & Marketing
- **Video**: Fully scripted, 5-minute structure
- **PH listing**: Templated in docs/marketing/

## Decisions Made During Build

<!-- Codex appends new decisions here as they're made -->

### Phase 1B / Auth
- **Decision**: Use Server Actions for `signIn`, `signUp`, `signOut`, and onboarding role assignment.
- **Reason**: Keeps auth mutations server-side and allows shared Zod validation across client and server.

### Phase 1B / Routing
- **Decision**: Keep middleware as the source of truth for auth-page redirects and role-route enforcement.
- **Reason**: Centralized route protection prevents inconsistent navigation behavior across pages.

### Phase 1C / Provider Scope
- **Decision**: Implement only provider CRUD surfaces (`/provider/patients`, `/provider/appointments`, `/provider/notes`) in this terminal.
- **Reason**: Prevented overlap with concurrent patient-page work and reduced merge conflict risk.

### Phase 1C / Actions
- **Decision**: Centralize appointment status and clinical-note mutations in `provider/appointments/actions.ts`.
- **Reason**: Keeps revalidation and validation behavior consistent across list and detail UIs.

### Phase 1D / Marketing Page
- **Decision**: Keep the landing page as a pure Server Component with anchor-link navigation.
- **Reason**: No runtime interactivity is required, so this keeps complexity and client JS minimal.

### Phase 1D / Trust Section
- **Decision**: Use technology badges and an operations snapshot card instead of external logo/image assets.
- **Reason**: Delivers social-proof structure quickly without adding asset management overhead.

### Phase 2A / Provider Dashboard
- **Decision**: Compute provider stats via targeted aggregate queries and derive pending-notes from completed appointments without notes.
- **Reason**: Keeps dashboard totals accurate while avoiding fragile client-side counting logic.

### Phase 2A / Admin Dashboard
- **Decision**: Build system activity by merging recent appointments and recent notes server-side and sorting by created timestamp.
- **Reason**: Provides a simple cross-entity activity feed without adding a dedicated audit table in this phase.

### Phase 3 / Error Handling
- **Decision**: Add route-group-level error boundaries for `(dashboard)` and `(auth)` in addition to global app error.
- **Reason**: Segment-specific fallbacks give users targeted recovery options without collapsing the full app shell.

### Phase 3 / Responsive Tables
- **Decision**: Hide lower-priority columns on small screens for provider/admin list pages while preserving full desktop data.
- **Reason**: Prevents horizontal crowding at 375px without introducing separate mobile-only list components.

### Phase 1C / Patient Booking
- **Decision**: Keep `/patient/appointments/new` as a client form with a server action (`bookAppointment`) for inserts.
- **Reason**: Preserves interactive multi-step UX while enforcing auth and Zod validation on the server.

### Phase 1C / Shared UI
- **Decision**: Reuse one `StatusBadge` and one `EmptyState` across patient and provider pages.
- **Reason**: Prevents status-color drift and keeps empty-state language consistent across roles.

### Phase 2A / Patient Dashboard
- **Decision**: Keep dashboard queries inside the Server Component with parallel count/data fetches.
- **Reason**: Delivers fresh role-scoped stats without client fetch waterfalls.

### Phase 2A / Health Summary
- **Decision**: Define summary as active conditions + active medications + active allergies.
- **Reason**: Keeps patient dashboard focused on current care context, not historical noise.

### Phase 2B / Messaging
- **Decision**: Implement messaging as server-rendered thread pages with refresh/revalidation instead of realtime sockets.
- **Reason**: Keeps scope aligned to phase goals while delivering secure asynchronous communication.

### Phase 2B / Settings
- **Decision**: Use one shared `/settings` route with role-specific detail sections (provider/patient/admin).
- **Reason**: Reduces duplicate pages and keeps profile/account updates in a single, consistent UX.

### Phase 2B / Admin Users
- **Decision**: Handle role/status mutations via admin-only server actions and client row-action dialogs.
- **Reason**: Preserves server-side authorization checks while keeping admin management interactions lightweight.

### Phase 3 / Validation Audit
- **Decision**: Standardize remaining high-impact forms (clinical notes, messaging, settings, admin role dialog) on RHF + Zod.
- **Reason**: Delivers consistent inline validation behavior and predictable submit-state UX.

### Phase 3 / Differentiator
- **Decision**: Implement CSV export for provider patient list and admin users via authenticated route handlers.
- **Reason**: High impact with low complexity and clear demo value without schema changes.
