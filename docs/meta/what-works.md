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
