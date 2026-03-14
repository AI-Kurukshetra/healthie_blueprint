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
