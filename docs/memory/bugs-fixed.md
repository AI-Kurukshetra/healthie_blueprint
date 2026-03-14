# Bugs Fixed

<!-- Updated at each phase completion. Format: Phase, Problem, Cause, Fix, Lesson -->
<!-- Append new entries below. Never overwrite existing entries. -->

*No bugs fixed yet — build has not started.*

## Phase 1B — Auth + Layout
- **Problem**: Auth routes intermittently returned `500` in dev with missing webpack chunk modules.
- **Cause**: Stale/corrupted `.next` cache after repeated server restarts and file changes.
- **Fix**: Cleared `.next` and restarted dev server; added build verification before phase sign-off.
- **Lesson**: If chunk module errors appear in dev, reset build cache first before changing app logic.

## Phase 1C — Provider CRUD
- **Problem**: Provider actions in server pages needed interactive controls (dropdown/dialog/edit toggles).
- **Cause**: Radix UI interactions require client components, while data pages are server components.
- **Fix**: Split interactions into small provider client components and kept data fetching in server pages.
- **Lesson**: Use server pages for queries and client islands for interactive mutations.

## Phase 1D — Landing Page
- **Problem**: `npm run build` failed on landing page copy with unescaped apostrophes in JSX text.
- **Cause**: ESLint `react/no-unescaped-entities` rule blocks raw `'` in text nodes.
- **Fix**: Replaced apostrophes with `&apos;` in affected strings and reran build.
- **Lesson**: Treat landing copy as linted JSX content; escape punctuation during implementation.

## Phase 2A — Provider/Admin Dashboards
- **Problem**: Dashboard placeholders had no operational value and did not satisfy Tier 2 verification.
- **Cause**: Provider/admin pages were scaffold placeholders from Phase 1B.
- **Fix**: Replaced placeholders with real Supabase-backed metrics, recent lists, and activity feeds.
- **Lesson**: Dashboard value comes from aggregated queries plus recent context, not single-card placeholders.

## Phase 3 — Provider/Admin Polish
- **Problem**: Missing segment error boundaries and route-level loading files reduced resilience and polish.
- **Cause**: Phase 1/2 focused on feature delivery, leaving some non-critical UX scaffolding incomplete.
- **Fix**: Added `(dashboard)` and `(auth)` error boundaries and missing provider detail/list loading skeleton files.
- **Lesson**: Treat error/loading coverage as part of done criteria, not post-feature cleanup.

## Phase 1C — Patient CRUD
- **Problem**: `npm run build` failed with a `BadgeValue` type mismatch in patient records badges.
- **Cause**: `StatusBadge` union excluded medical-record type values (`condition`, `medication`, `allergy`).
- **Fix**: Extended badge union and style/label mappings to include medical record types.
- **Lesson**: Keep shared enum-like UI components aligned with every domain validation union.

## Phase 1C — Build Verification
- **Problem**: Build intermittently failed with `Failed to collect page data for /onboarding`.
- **Cause**: stale `.next` artifacts after rapid concurrent file updates.
- **Fix**: Cleared `.next` and rebuilt successfully.
- **Lesson**: When route modules exist but build cannot resolve them, clear cache before deeper debugging.

## Phase 2A — Dashboard Build Gate
- **Problem**: `npm run build` failed during this phase on `react/no-unescaped-entities` in provider dashboard copy.
- **Cause**: Unescaped apostrophe in button label text (`Today's`).
- **Fix**: Escaped as `Today&apos;s` and reran build.
- **Lesson**: Treat lint content errors as release blockers since they fail production builds.

## Phase 2B — Messaging Unread Counts
- **Problem**: Conversation unread badges could overcount messages that were already read.
- **Cause**: Thread summary logic incremented unread count for all received messages without checking `read_at`.
- **Fix**: Included `read_at` in message queries and only incremented unread counts when `read_at` is null.
- **Lesson**: Message badge calculations should always align with persisted read-state fields.

## Phase 3 — Settings Forms Validation
- **Problem**: Settings/profile flows lacked field-level inline validation and relied mostly on server response errors.
- **Cause**: Forms were plain submit handlers without `react-hook-form` + `zodResolver`.
- **Fix**: Migrated settings forms to RHF+Zod with inline `FormMessage` feedback and disabled submit states.
- **Lesson**: Keep all core forms on a shared RHF+Zod pattern to avoid inconsistent error UX.
