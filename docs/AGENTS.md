# CareSync — Docs Directory Guide

This directory contains all project documentation, build phases, templates, and memory files.

## How to Use

### Building a Phase
Read the full phase doc before implementation:
- `docs/phases/phase-{id}.md` — self-contained build instructions
- Reference `docs/rules/` for conventions as needed
- Reference `docs/templates/` for reusable code patterns

### Templates
Templates are ready-to-use code patterns. Copy and adapt:
- `schema.sql` — Full database schema, run in Supabase SQL Editor
- `auth-option-a.md` — Profile trigger auth pattern
- `rls-patterns.md` — All RLS policy templates (4 patterns)
- `layout-sidebar.md` — Sidebar layout component spec
- `theme-professional.md` — Professional color scheme CSS variables
- `seed-script.md` — Seed script skeleton and data realism rules

### Memory Files (updated at phase completion)
- `memory/` — Bugs fixed, decisions, anti-patterns, reusable patterns
- `meta/` — Product info, current state, what works

### Marketing (post-build)
- `marketing/video-script.md` — 5-minute demo script template
- `marketing/ph-listing.md` — Product Hunt listing template
- `marketing/social-templates.md` — LinkedIn/Twitter share templates
