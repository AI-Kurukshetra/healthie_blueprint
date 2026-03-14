# CareSync — AGENTS.md

## Project Overview

CareSync is an API-first virtual health platform (EHR) for virtual-first healthcare organizations. It enables providers to manage patients, schedule appointments, and write clinical notes — while patients can book visits, view records, and communicate with their care team. Built as a modern alternative to Healthie.

See: docs/meta/project-info.md for full product details and current build state.

## Tech Stack

- Next.js 15 (App Router) with TypeScript (strict mode)
- Supabase (Auth + PostgreSQL + Row Level Security)
- shadcn/ui + Tailwind CSS (professional theme)
- Deployed on Vercel
- Package manager: npm
- Seed data: standalone script (scripts/seed.ts)

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, signup, onboarding (role selection)
│   ├── (dashboard)/      # Protected routes — provider, patient, admin views
│   ├── api/              # API routes (if needed)
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Public landing page
├── components/
│   ├── ui/               # shadcn auto-generated components
│   ├── layout/           # Sidebar, header, nav components
│   ├── provider/         # Provider-specific components
│   ├── patient/          # Patient-specific components
│   ├── admin/            # Admin-specific components
│   └── shared/           # Shared components (empty states, skeletons, etc.)
├── lib/
│   ├── supabase/
│   │   ├── client.ts     # Browser client
│   │   ├── server.ts     # Server client (cookies)
│   │   └── middleware.ts  # Auth middleware helper
│   ├── utils.ts
│   └── validations/      # Zod schemas per entity
├── hooks/
├── types/
│   └── database.ts       # Supabase generated types
└── config/
    └── nav.ts            # Role-based navigation config
```

## Three User Roles

- **patient** — Books appointments, views own records, manages health profile
- **provider** — Manages appointments, writes clinical notes (SOAP), views patient data
- **admin** — Manages all users, views system-wide stats, platform settings

Role is stored in `profiles.role` and determines sidebar nav, dashboard content, and RLS access.

## Quick Reference

- Product details & current state: docs/meta/project-info.md
- Decisions log: docs/memory/decisions.md
- What works well: docs/meta/what-works.md
- Anti-patterns to avoid: docs/memory/dont-do.md
- Reusable patterns: docs/memory/patterns.md
- Bugs fixed log: docs/memory/bugs-fixed.md

## Rules (reference when writing code)

- TypeScript: docs/rules/typescript.md
- Component patterns: docs/rules/components.md
- Data fetching: docs/rules/data-fetching.md
- Styling & UI: docs/rules/styling.md
- Error handling: docs/rules/error-handling.md
- Security & RLS: docs/rules/security.md
- Git workflow: docs/rules/git.md
- Testing: docs/rules/testing.md
- Dev workflow: docs/rules/workflow.md

## Build Phases

Work through phases in order. Each phase doc is self-contained.
Read the full phase doc before starting implementation.

- Phase 1A (Foundation): docs/phases/phase-1a-foundation.md
- Phase 1B (Auth + Layout): docs/phases/phase-1b-auth-layout.md
- Phase 1C (Core CRUD): docs/phases/phase-1c-core-crud.md
- Phase 1D (Landing Page): docs/phases/phase-1d-landing.md
- Phase 2A (Dashboard Stats): docs/phases/phase-2a-dashboard.md
- Phase 2B (Secondary Features): docs/phases/phase-2b-secondary.md
- Phase 3 (Polish): docs/phases/phase-3-polish.md

## Templates

- Database schema: docs/templates/schema.sql
- Auth (profile trigger): docs/templates/auth-option-a.md
- RLS policy patterns: docs/templates/rls-patterns.md
- Sidebar layout: docs/templates/layout-sidebar.md
- Professional theme: docs/templates/theme-professional.md
- Seed script: docs/templates/seed-script.md

## Behavioral Rules

1. Read the full phase document before starting implementation.
2. Implement in order: schema → server logic → UI.
3. Complete everything in a phase before moving to the next.
4. If a detail is missing, make a reasonable decision and note it in a code comment.
5. Do not refactor working code unless the phase doc explicitly asks for it.
6. Never commit directly to main — always work on the current phase branch.
7. Commit after each logical unit of work with format: `phase-{id}: {description}`.

## Memory Updates (at phase completion)

After completing each phase and before merging to main, update all relevant docs/ files:

1. Append any bugs fixed → docs/memory/bugs-fixed.md
2. Append any decisions made → docs/memory/decisions.md
3. Append any anti-patterns discovered → docs/memory/dont-do.md
4. Append any reusable patterns → docs/memory/patterns.md
5. Update current phase status → docs/meta/project-info.md
6. Append what worked well → docs/meta/what-works.md

Format: append to existing content, never overwrite previous entries.
Keep entries concise — 2-4 lines each.
Commit memory updates as part of the phase completion commit.
