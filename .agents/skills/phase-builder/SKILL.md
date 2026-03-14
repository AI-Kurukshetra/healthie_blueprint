---
name: phase-builder
description: |
  Use when starting, executing, or completing a build phase. Provides the phase
  execution workflow, git branching, memory updates, and deployment checkpoints.
  Trigger on phrases like "start phase", "next phase", "complete phase", "merge phase".
---

# Phase Builder — CareSync Build Workflow

## Phase Execution Flow

1. Create phase branch: `git checkout -b phase/{id}-{description}`
2. Read the full phase document from `docs/phases/phase-{id}.md` before starting
3. Implement in order: **database schema → server logic → UI components → pages**
4. Test locally: verify core flows, run `npm run build` in `web/`
5. Update memory files (`docs/memory/` and `docs/meta/`)
6. Commit all changes with format: `phase-{id}: {description}`
7. Merge to main: `git checkout main && git merge phase/{id}-{description}`
8. Push: `git push origin main`
9. Verify Vercel deploy loads correctly
10. Start next phase

## Phase Sequence

| Phase | Name | Target Time | Branch |
|-------|------|-------------|--------|
| 1A | Foundation | ~30 min | `phase/1a-foundation` |
| 1B | Auth + Layout | ~60 min | `phase/1b-auth-layout` |
| 1C | Core CRUD | ~60 min | `phase/1c-core-crud` |
| 1D | Landing Page | ~30 min | `phase/1d-landing` |
| 2A | Dashboard Stats | ~45 min | `phase/2a-dashboard` |
| 2B | Secondary Features | ~45 min | `phase/2b-secondary` |
| 3 | Polish | ~60 min | `phase/3-polish` |

## Deploy Checkpoints (Push to Main After)

- Phase 1A — Pipeline validation (empty shell loads)
- Phase 1C — First real version (auth + CRUD + data)
- Phase 1D — Tier 1 done (fully submittable product)
- Phase 2B — Tier 2 done (competitive product)
- Phase 3 — Final build version

## Commit Convention

Format: `phase-{id}: {brief description}`

```
phase-1a: scaffold Next.js project with TypeScript and Tailwind
phase-1b: implement auth pages and role-based onboarding
phase-1c: add appointments table with RLS and CRUD
```

## Memory Updates (Required Before Merging)

After completing each phase, update ALL relevant files:

1. `docs/memory/bugs-fixed.md` — Append bugs fixed
2. `docs/memory/decisions.md` — Append decisions made
3. `docs/memory/dont-do.md` — Append anti-patterns discovered
4. `docs/memory/patterns.md` — Append reusable patterns
5. `docs/meta/project-info.md` — Update current phase status
6. `docs/meta/what-works.md` — Append what worked well

Format: append to existing content, never overwrite. Keep entries 2-4 lines each.

## Scope Cutting Rules

- If a feature takes >30 minutes and isn't Tier 1 — cut it
- "Works but ugly" beats "beautiful but broken"
- Never sacrifice auth or seed data for a fancy feature
- One deep feature beats three shallow ones
- Deploy after every milestone — never save deployment for the end

## Pre-Merge Verification Checklist

- [ ] `npm run build` in `web/` completes without errors
- [ ] Core flows work (navigate main user paths)
- [ ] Auth works (signup, login, logout, correct role views)
- [ ] Data persists (created items appear after page refresh)
- [ ] RLS works (users can't see other users' data)
- [ ] Mobile passes (key pages at 375px width)
