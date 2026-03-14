# Workflow Rules

## Phase System
Work through phases in strict order. Each phase doc in docs/phases/ is self-contained.

### Phase Execution Flow
1. Create phase branch: `git checkout -b phase/{id}-{description}`
2. Read the full phase document before starting
3. Implement in order: database schema → server logic → UI components → pages
4. Test locally: verify core flows, run `npm run build`
5. Update memory files (docs/memory/ and docs/meta/)
6. Commit all changes
7. Merge to main: `git checkout main && git merge phase/{id}-{description}`
8. Push: `git push origin main`
9. Verify Vercel deploy loads correctly
10. Start next phase

### Phase Timeline (Target: 5-6 hours total build)
- Phase 1A (Foundation): ~30 min
- Phase 1B (Auth + Layout): ~60 min
- Phase 1C (Core CRUD): ~60 min
- Phase 1D (Landing Page): ~30 min
- Phase 2A (Dashboard Stats): ~45 min
- Phase 2B (Secondary Features): ~45 min
- Phase 3 (Polish): ~60 min

### Deploy Checkpoints
Push to main (triggering deploy) after:
- Phase 1A complete (pipeline validation — empty shell loads)
- Phase 1C complete (first real version — auth + CRUD + data)
- Phase 1D complete (Tier 1 done — fully submittable product)
- Phase 2B complete (Tier 2 done — competitive product)
- Phase 3 complete (final build version)

## Scope Cutting Rules
- If a feature takes >30 minutes and isn't Tier 1 — cut it
- "Works but ugly" beats "beautiful but broken"
- Never sacrifice auth or seed data for a fancy feature
- One deep feature beats three shallow ones
- Deploy after every milestone — never save deployment for the end

## When Stuck
- Paste the exact error message back to Codex: "Fix this error: [error]"
- If Codex loops on the same error 3 times, stop and read the code yourself
- If stuck for >15 minutes on one problem, skip it and move on
- Check docs/troubleshooting.md for common issues
- Run `npm run build` locally to catch production-only errors

## Memory Update Cadence
Update docs/memory/ and docs/meta/ files at the end of each phase, before merging.
This ensures Codex gets smarter with each phase — knowing what worked, what broke, and what to avoid.
