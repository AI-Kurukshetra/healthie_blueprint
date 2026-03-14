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
- SOAP clinical documentation with AI-assisted note generation
- Patient health records (conditions, medications, allergies)
- Secure messaging
- Role-based dashboards with analytics
- Row Level Security on every table
- Responsive design + dark mode
- Healthie-inspired professional UI

## Alternative To
Healthie (gethealthie.com)

## Built For
AI Mahakurukshetra Hackathon 2026 by Bacancy
