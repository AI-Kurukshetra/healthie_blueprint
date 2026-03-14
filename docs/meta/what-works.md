# What Works

<!-- Updated at each phase completion. Append new entries below. -->

## Pre-Planned (Stack-Level Knowledge)

- `@supabase/ssr` handles server/client/middleware clients cleanly for Next.js App Router
- shadcn/ui + Tailwind produces polished UI fast with minimal custom CSS
- Profile trigger pattern guarantees a profile row exists for every authenticated user
- Phase-branch workflow keeps main always deployable
- Standalone seed script is cleanest — runs independently, re-runnable, no app dependency
- Server Components for data fetching eliminates the need for client-side loading states in many cases
- Zod schemas shared between client and server ensure validation consistency
- Role-based nav config object makes sidebar rendering trivial — just look up by role

## Discovered During Build

<!-- Codex appends new entries here -->

### Phase 1B
- Shared auth Zod schemas used by both forms and Server Actions kept validation consistent.
- Middleware-first redirect logic cleanly handled login/signup/onboarding/dashboards without page-level duplication.
- Role-card onboarding with one server action made role assignment and post-selection navigation predictable.

### Phase 1C
- Provider CRUD worked best with server-rendered data tables and client-only action controls.
- Reusing `StatusBadge` across appointments and medical records kept status semantics consistent.
- Provider notes list linking back to appointment detail created a single source of truth for note editing.

### Phase 1D
- Static section maps (`features`, `steps`, `tech`) kept landing content easy to iterate without changing layout structure.
- Card-based hero snapshot and feature grid delivered a Product Hunt screenshot-ready layout quickly.
- Anchor CTA (`Learn More` to `#features`) provided simple in-page navigation without adding client JS.

### Phase 2A
- Parallel server queries (`Promise.all`) kept dashboard pages responsive even with multiple stat cards and lists.
- Shared `StatCard` + table/list blocks made provider/admin dashboards consistent without extra styling overhead.
- A merged activity feed (appointments + notes) gave admins useful system visibility with minimal new schema work.

### Phase 3
- Route-group error boundaries improved recovery UX by containing failures to auth/dashboard segments.
- Loading skeletons that mirror real layouts made provider/admin route transitions feel intentional and stable.
- Mobile column prioritization preserved key actions on provider/admin tables at narrow viewport widths.

### Phase 1C (Patient Scope)
- Patient appointments render cleanly with server data + card UI and a dedicated booking form page.
- Server action booking with shared Zod schema prevented invalid payloads from reaching the database.
- Shared EmptyState/StatusBadge components reduced duplicated UI logic across patient pages.

### Phase 2A (Patient Scope)
- Parallel server queries made dashboard stats fast and predictable under RLS.
- Combining StatCards with a dedicated next-appointment card improved scanability for patients.
- Health summary badges (conditions/medications/allergies) provided useful context without overwhelming detail.

### Phase 2B
- URL/query-param based filtering worked well for provider patient search because state survives refresh/share links.
- A shared message thread component reduced duplicate UI while supporting both patient and provider inboxes.
- Consolidating settings into one role-aware page made profile maintenance faster without nav fragmentation.

### Phase 3 (Patient Scope)
- RHF + Zod migration on clinical note, messaging, settings, and admin-role forms improved validation consistency.
- Adding route-group error boundaries gave cleaner failure recovery for auth and dashboard contexts.
- CSV export endpoints provided a practical demo-ready differentiator with minimal implementation risk.
