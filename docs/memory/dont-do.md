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
