# Git Rules

## Branching Strategy
- `main` — always deployable, auto-deploys to Vercel on push
- Phase branches: `phase/{id}-{description}`
- Never commit directly to main

### Branch Names
```
phase/1a-foundation
phase/1b-auth-layout
phase/1c-core-crud
phase/1d-landing
phase/2a-dashboard
phase/2b-secondary
phase/3-polish
```

## Commit Convention
Format: `phase-{id}: {brief description}`

Examples:
```
phase-1a: scaffold Next.js project with TypeScript and Tailwind
phase-1a: configure Supabase client and middleware
phase-1b: implement auth pages and role-based onboarding
phase-1c: add appointments table with RLS and CRUD
phase-1c: create clinical notes SOAP form
phase-1c: add seed data script with demo users
phase-1d: build landing page with hero and features
phase-2a: add provider dashboard with stats cards
```

Commit after each logical unit of work — not after every file change, but not waiting until the whole phase is done either.

## Merge Flow
After verifying a phase locally:
```bash
git add .
git commit -m "phase-{id}: final phase description"
# Update memory files
git add docs/
git commit -m "phase-{id}: update memory files"
# Merge to main
git checkout main
git merge phase/{id}-{description}
git push origin main
# Verify Vercel deploy
# Start next phase
git checkout -b phase/{next-id}-{description}
```

## .gitignore Must Include
```
node_modules/
.next/
.env.local
.env*.local
*.tsbuildinfo
```

## Rules
- Every merge to main triggers a Vercel deploy — verify the deploy succeeds
- If a deploy breaks, roll back on Vercel dashboard (one click) and fix on the branch
- Memory file updates are committed as part of the phase completion, before merging
