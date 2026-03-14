# Phase 1D — Landing Page (~30 min)

## Goal
Build a public-facing landing page that explains what CareSync does, who it's for, and drives signups. This is the first thing judges and Product Hunt visitors see.

## Page: `/` (src/app/page.tsx)

This is a Server Component. No auth required — it's public.

### Structure

**Hero Section**
- Headline: "Modern EHR for Virtual-First Healthcare"
- Subheadline: "Streamline appointments, clinical documentation, and patient care — all in one platform. A clean, modern alternative to legacy EHR systems."
- Two CTA buttons: "Get Started" (→ /signup) and "Learn More" (scroll to features)
- Optional: a screenshot or illustration of the dashboard in the background/side

**Features Section**
- Section heading: "Everything your virtual clinic needs"
- 3-column grid (stacks on mobile), each feature card:
  1. **Smart Scheduling** (Calendar icon) — "Patients book appointments online. Providers manage their schedule effortlessly. Automated reminders keep everyone on track."
  2. **Clinical Documentation** (ClipboardList icon) — "SOAP-formatted clinical notes linked to every appointment. Write, review, and manage documentation in seconds."
  3. **Patient Portal** (Heart icon) — "Patients view their records, track appointments, and communicate with their care team — all from one dashboard."
  4. **Provider Dashboard** (LayoutDashboard icon) — "At-a-glance view of today's appointments, patient queue, and clinical tasks. Built for efficiency."
  5. **Role-Based Access** (Shield icon) — "Separate views for patients, providers, and administrators. Every user sees exactly what they need."
  6. **Secure by Design** (Lock icon) — "Row-level security on every table. HIPAA-aligned architecture. Your data stays yours."

**How It Works Section**
- Section heading: "Get started in 3 steps"
- Three numbered steps:
  1. "Sign up and choose your role"
  2. "Set up your profile and availability"
  3. "Start managing appointments and patient care"

**Social Proof / Trust Section**
- "Built with modern, trusted technologies"
- Tech logos or badges: Next.js, Supabase, Vercel, TypeScript
- Or a simple "Trusted by virtual-first clinics" with placeholder stat cards

**CTA Section**
- "Ready to modernize your practice?"
- "Get Started for Free" button (→ /signup)
- "View Demo" button (→ /login with demo credentials hint)

**Footer**
- CareSync logo + tagline
- Links: Features, About, Privacy, Terms (can be placeholder # links)
- "Built with ❤️ for modern healthcare"
- © 2026 CareSync

### Design Notes
- Professional healthcare feel — blues, clean whites, slate grays
- Use shadcn Card components for feature cards
- Generous spacing — `py-20` between sections
- Landing page does NOT use the sidebar layout — it's a standalone full-width page
- Ensure the root `layout.tsx` conditionally renders sidebar only for (dashboard) routes, not for the landing page
- Mobile: all grids stack to single column, hero text centers

### Technical Implementation
- `src/app/page.tsx` — Server Component, no client interactivity needed
- If you want a smooth scroll for "Learn More", add a small client component just for that
- Import Lucide icons directly
- Use `next/link` for all internal navigation
- Use `next/image` if adding screenshots/illustrations

## Verification Checklist
- [ ] Landing page loads at root URL (/) without auth
- [ ] All sections render with proper spacing and responsive layout
- [ ] CTAs link to /signup and /login correctly
- [ ] Mobile view: grids stack, text is readable, CTAs are tappable
- [ ] Page looks professional enough to screenshot for Product Hunt
- [ ] Authenticated users who visit / see the landing page (they can navigate to dashboard from nav)
- [ ] `npm run build` passes

## Deploy Checkpoint: YES — Tier 1 complete, fully submittable product
