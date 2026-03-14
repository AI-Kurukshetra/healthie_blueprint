# CareSync
Modern EHR platform for virtual-first healthcare teams. A clean alternative to Healthie.

## What It Does
- Providers: Manage patients, appointments, write SOAP clinical notes
- Patients: Book appointments, view health records, message providers
- Admins: Manage users, view system-wide analytics

## Tech Stack
- Next.js 15 (App Router) + TypeScript
- Supabase (Auth + PostgreSQL + Row Level Security)
- shadcn/ui + Tailwind CSS
- Deployed on Vercel

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Populate the file with your Supabase project URL, anon key, and service role key.
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000 in your browser.

## Scripts
- `npm run dev` – Start the Next.js dev server
- `npm run build` – Create an optimized production build
- `npm run start` – Run the production build locally
- `npm run lint` – Lint the project with ESLint + Next.js rules

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Provider | provider@caresync.demo | Demo1234! |
| Patient | patient@caresync.demo | Demo1234! |
| Admin | admin@caresync.demo | Demo1234! |

## Features
- Three-role authentication with onboarding
- Appointment scheduling and management
- SOAP clinical documentation with AI-powered note generation (Gemini / Groq)
- Patient health records (conditions, medications, allergies)
- Secure messaging
- Role-based dashboards with analytics
- Notification system with "Read All" support
- Row Level Security on every table
- Responsive design + dark mode
- Healthie-inspired professional UI

## Changelog

### v0.3.0
- Added "Read All" button to notification dropdown for marking all notifications as read
- Fixed appointment row action sizing for consistent menu option heights
- Fixed dialog animation to open from center instead of bottom-left
- Fixed Vercel deployment (framework preset corrected to Next.js)

### v0.2.0
- Added AI-powered SOAP note generation using Gemini and Groq
- Upgraded to Next.js 15 with React 19
- Added regenerate and clear controls for AI-generated notes
- Upgraded cmdk to v1 for React 19 compatibility

### v0.1.0
- Initial release with provider, patient, and admin dashboards
- Appointment scheduling, clinical notes, and secure messaging
- Supabase auth with Row Level Security
- Responsive UI with dark mode

## Alternative To
Healthie (gethealthie.com)

## Built For
AI Mahakurukshetra Hackathon 2026 by Bacancy
