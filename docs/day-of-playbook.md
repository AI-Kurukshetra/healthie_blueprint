# Day-of Playbook — March 14, 2026

## Before the Clock Starts (~15 min before)
- [ ] Open browser tabs: Supabase dashboard, Vercel dashboard, GitHub (Bacancy org)
- [ ] Open terminal with Codex CLI ready
- [ ] Have `docs/` folder accessible locally
- [ ] Open hackathon event platform
- [ ] Have this playbook open on a second screen or printed

## Minute 0–10: Project Setup
- [ ] Create GitHub repo in Bacancy org with required naming format
- [ ] Clone repo locally
- [ ] Copy all docs/ files and AGENTS.md into the repo
- [ ] Initial commit and push
- [ ] Create Supabase project (Mumbai or Singapore region)
- [ ] Save database password, copy Project URL + anon key
- [ ] Connect repo to Vercel

## Minute 10–40: Phase 1A — Foundation
- [ ] `git checkout -b phase/1a-foundation`
- [ ] Tell Codex: "Read docs/phases/phase-1a-foundation.md and implement everything"
- [ ] Set environment variables in `.env.local` and Vercel
- [ ] Run schema.sql in Supabase SQL Editor
- [ ] Verify first deploy on Vercel loads
- [ ] Merge to main, push

## Minute 40–100: Phase 1B — Auth + Layout
- [ ] `git checkout -b phase/1b-auth-layout`
- [ ] Tell Codex: "Read docs/phases/phase-1b-auth-layout.md and implement everything"
- [ ] Configure Supabase Auth URL settings (Site URL = Vercel URL, add redirect URLs)
- [ ] Test: signup → onboarding → role selection → dashboard
- [ ] Test: login, logout, middleware redirects
- [ ] Merge to main

## Minute 100–160: Phase 1C — Core CRUD
- [ ] `git checkout -b phase/1c-core-crud`
- [ ] Tell Codex: "Read docs/phases/phase-1c-core-crud.md and implement everything"
- [ ] Run seed script: `npx tsx scripts/seed.ts`
- [ ] Test as provider: patients list, appointment detail, write clinical note
- [ ] Test as patient: appointments list, book appointment, view records
- [ ] Merge to main, push — **DEPLOY CHECKPOINT**
- [ ] Verify Vercel: auth works, seed data visible

## Minute 160–190: Phase 1D — Landing Page
- [ ] `git checkout -b phase/1d-landing`
- [ ] Tell Codex: "Read docs/phases/phase-1d-landing.md and implement everything"
- [ ] Verify landing page looks professional, CTAs work
- [ ] Merge to main, push — **DEPLOY CHECKPOINT (Tier 1 complete)**

## ⏱️ Tier 1 Target: 3 hours 10 min. You now have a submittable product.

## Minute 190–235: Phase 2A — Dashboard Stats
- [ ] `git checkout -b phase/2a-dashboard`
- [ ] Tell Codex: "Read docs/phases/phase-2a-dashboard.md and implement everything"
- [ ] Verify all three role dashboards show correct data
- [ ] Merge to main

## Minute 235–280: Phase 2B — Secondary Features
- [ ] `git checkout -b phase/2b-secondary`
- [ ] Tell Codex: "Read docs/phases/phase-2b-secondary.md and implement everything"
- [ ] Test: patient search, messaging, admin user management, settings
- [ ] Merge to main, push — **DEPLOY CHECKPOINT (Tier 2 complete)**

## Minute 280–340: Phase 3 — Polish
- [ ] `git checkout -b phase/3-polish`
- [ ] Tell Codex: "Read docs/phases/phase-3-polish.md and implement everything"
- [ ] Priority: skeleton loaders → empty states → form validation → responsive → differentiator
- [ ] Run `npm run build` — must pass
- [ ] Full manual walkthrough (see Phase 3 checklist)
- [ ] Merge to main, push — **DEPLOY CHECKPOINT (final build)**

## ⏱️ Build Target: 5-6 hours. Everything below is post-build.

## Post-Build: Bug Fixes + Polish (flexible)
- [ ] Full walkthrough as each role
- [ ] Mobile testing at 375px
- [ ] Fix any visual issues or bugs
- [ ] Take screenshots for PH listing (minimum 3: dashboard, core feature, landing page)

## Post-Build: Demo Video
- [ ] Open docs/marketing/video-script.md
- [ ] Fill in product-specific placeholders
- [ ] Practice reading once
- [ ] Record 5-minute demo (use deployed app, not localhost)
- [ ] Upload to Google Drive, set "Anyone with link can view"
- [ ] Copy share link

## Post-Build: Product Hunt Listing
- [ ] Open docs/marketing/ph-listing.md
- [ ] Fill in all fields
- [ ] Upload screenshots
- [ ] Add demo video link
- [ ] Add live URL and GitHub repo link
- [ ] Save as draft (launch on assigned date)

## Post-Build: Final Submission
- [ ] Submit on hackathon event platform:
  - GitHub repository link
  - Live deployed app URL (Vercel)
  - Google Drive video link
  - Product Hunt listing URL
- [ ] Verify all links work
- [ ] Done! 🎉

## Emergency Protocols

**Behind at 3 hours**: Focus exclusively on Tier 1. Skip Tier 2/3. A working simple app > broken complex app.

**Deploy broken**: Roll back on Vercel (one click), fix locally, redeploy.

**Auth broken**: Check Supabase URL Configuration. See docs/troubleshooting.md.

**Seed data missing**: Run INSERT statements directly in Supabase SQL Editor.

**Codex stuck in a loop**: Stop, read the error yourself, give a more specific instruction.
