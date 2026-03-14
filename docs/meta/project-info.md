# Project Info

## Product

- **Name**: CareSync
- **Tagline**: Modern EHR for virtual-first healthcare teams
- **Description**: CareSync is an API-first virtual health platform that helps providers manage patients, schedule appointments, and write clinical documentation — while patients can book visits, view their records, and communicate with their care team. A clean, modern alternative to Healthie.
- **Target users**: Virtual-first clinics, telehealth providers, digital health startups
- **Core entity**: Appointments (connects patients ↔ providers)
- **Alternatives**: Healthie, Canvas Medical, Elation Health
- **Category**: Clinical Operations & Care Delivery

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Supabase (Auth + PostgreSQL + RLS)
- shadcn/ui + Tailwind CSS
- Deployed on Vercel
- npm

## Key Entities

- profiles (id, email, full_name, role, avatar_url, phone, date_of_birth)
- provider_details (specialization, license_number, bio)
- patient_details (blood_type, emergency_contact, insurance_provider, insurance_id)
- appointments (patient_id, provider_id, date_time, duration, status, type)
- clinical_notes (appointment_id, provider_id, patient_id, SOAP fields)
- medical_records (patient_id, type, name, details, status)
- messages (sender_id, receiver_id, content) — Tier 2
- availability (provider_id, day_of_week, start/end time) — for scheduling

## Current Build State

- Phase 1A (Foundation): ⬜ Not started
- Phase 1B (Auth + Layout): ⬜ Not started
- Phase 1C (Core CRUD): ⬜ Not started
- Phase 1D (Landing Page): ⬜ Not started
- Phase 2A (Dashboard Stats): ⬜ Not started
- Phase 2B (Secondary Features): ⬜ Not started
- Phase 3 (Polish): ⬜ Not started

## Demo Credentials

- **Provider**: provider@caresync.demo / Demo1234!
- **Patient**: patient@caresync.demo / Demo1234!
- **Admin**: admin@caresync.demo / Demo1234!
