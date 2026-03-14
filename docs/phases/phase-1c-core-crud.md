# Phase 1C — Core CRUD (~60 min)

## Goal
Build the core entity CRUD: appointments, clinical notes, patient/provider detail pages, and seed data. After this phase, the app is functional — providers manage appointments and write SOAP notes, patients book and view appointments.

## Database
Ensure all tables from docs/templates/schema.sql are created:
- profiles (already done in 1B)
- provider_details
- patient_details
- appointments
- clinical_notes
- medical_records
- availability

All with RLS policies applied (see docs/templates/rls-patterns.md).

## Zod Validation Schemas

Create these in `src/lib/validations/`:

**appointment.ts**
```ts
import { z } from 'zod';

export const createAppointmentSchema = z.object({
  provider_id: z.string().uuid(),
  date_time: z.string().datetime(),
  duration_minutes: z.number().min(15).max(120).default(30),
  type: z.enum(['initial', 'follow_up', 'consultation']),
  notes: z.string().max(500).optional(),
});

export const updateAppointmentStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
```

**clinical-note.ts**
```ts
import { z } from 'zod';

export const createClinicalNoteSchema = z.object({
  appointment_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  subjective: z.string().min(1, 'Subjective is required').max(5000),
  objective: z.string().max(5000).optional(),
  assessment: z.string().max(5000).optional(),
  plan: z.string().max(5000).optional(),
});

export type CreateClinicalNoteInput = z.infer<typeof createClinicalNoteSchema>;
```

**medical-record.ts**
```ts
import { z } from 'zod';

export const createMedicalRecordSchema = z.object({
  patient_id: z.string().uuid(),
  type: z.enum(['condition', 'medication', 'allergy']),
  name: z.string().min(1).max(200),
  details: z.string().max(2000).optional(),
  status: z.enum(['active', 'resolved', 'discontinued']).default('active'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});
```

## Provider Pages

### Patients List — `/provider/patients`
**src/app/(dashboard)/provider/patients/page.tsx**
- Server Component: fetch all patients assigned to this provider (via appointments relationship — distinct patient_id from appointments where provider_id = current user)
- Table columns: name, email, phone, last appointment date, status badge
- Click row → patient detail page
- Empty state: "No patients yet — they'll appear here once they book appointments" (Users icon)
- `loading.tsx`: skeleton table with 5 rows

### Patient Detail — `/provider/patients/[id]`
**src/app/(dashboard)/provider/patients/[id]/page.tsx**
- Server Component: fetch patient profile + provider_details/patient_details
- Patient info header card: name, DOB, phone, email, insurance info
- Tabs component (shadcn Tabs): Appointments | Clinical Notes | Medical Records
- Each tab shows filtered list for this patient
- Medical records tab: conditions, medications, allergies with status badges (active=green, resolved=gray, discontinued=red)
- `not-found.tsx` for invalid patient IDs

### Appointments List — `/provider/appointments`
**src/app/(dashboard)/provider/appointments/page.tsx**
- Server Component: fetch all appointments for this provider with patient profile joined
- Table columns: patient name, date/time (formatted with date-fns), type badge, status badge, actions dropdown
- Status badges: scheduled (blue), completed (green), cancelled (gray), no_show (red)
- Type badges: initial (purple), follow_up (blue), consultation (teal)
- Actions dropdown: View Detail, Mark Complete, Cancel
- Sort by date_time ascending (upcoming first by default)
- Empty state: "No appointments scheduled" (Calendar icon)
- `loading.tsx`: skeleton table

### Appointment Detail — `/provider/appointments/[id]`
**src/app/(dashboard)/provider/appointments/[id]/page.tsx**
- Server Component: fetch appointment with patient profile and any existing clinical note
- Header: patient name, date/time, type, duration, status
- Status change buttons: "Mark Complete" (if scheduled), "Cancel" (with confirmation dialog)
- Clinical Notes section:
  - If note exists → display SOAP fields in read mode with "Edit" button
  - If no note → show "Add Clinical Note" button that reveals the SOAP form
- SOAP form: 4 labeled textareas (Subjective, Objective, Assessment, Plan)
- Save note → Server Action creates/updates clinical_notes row
- `not-found.tsx` for invalid appointment IDs

**Server Actions — src/app/(dashboard)/provider/appointments/actions.ts**
- `updateAppointmentStatus(id, status)` — validates with Zod, updates appointment, revalidates path
- `createClinicalNote(formData)` — validates SOAP fields, inserts clinical_notes row
- `updateClinicalNote(id, formData)` — validates, updates existing note (confirmation required in UI)

### Clinical Notes List — `/provider/notes`
**src/app/(dashboard)/provider/notes/page.tsx**
- Server Component: fetch all clinical notes by this provider with patient name and appointment date joined
- Table: patient name, appointment date, note preview (first 100 chars of subjective), created date
- Click row → navigates to the appointment detail page where the note lives
- Empty state: "No clinical notes yet — create notes from appointment details" (ClipboardList icon)

## Patient Pages

### Appointments List — `/patient/appointments`
**src/app/(dashboard)/patient/appointments/page.tsx**
- Server Component: fetch all appointments for this patient with provider profile joined
- Card layout (more friendly than a table for patients):
  - Provider name + specialization
  - Date/time formatted nicely
  - Type + status badges
  - "View Details" link
- "Book New Appointment" button (prominent, top right)
- Empty state: "No appointments yet — book your first visit" (Calendar icon + CTA button)

### Book Appointment — `/patient/appointments/new`
**src/app/(dashboard)/patient/appointments/new/page.tsx**
- Client Component (form interactivity needed)
- Step 1: Select a provider — list of providers with name, specialization, and bio
  - Fetch from profiles where role='provider' joined with provider_details
  - Card selection UI
- Step 2: Pick date and time
  - Date picker (use shadcn Popover + Calendar if available, or a simple date input)
  - Time slot selection (morning, afternoon, evening — or specific times if availability table is populated)
- Step 3: Appointment details
  - Type: initial / follow_up / consultation (Select)
  - Notes: optional textarea for patient
  - Duration: default 30 min
- Submit → Server Action creates appointment with status "scheduled"
- On success: redirect to `/patient/appointments` with success toast

**Server Action — src/app/(dashboard)/patient/appointments/actions.ts**
- `bookAppointment(formData)` — validates with createAppointmentSchema, inserts appointment, revalidates path

### Health Records — `/patient/records`
**src/app/(dashboard)/patient/records/page.tsx**
- Server Component: fetch medical records for this patient
- Three sections (or tabs): Conditions | Medications | Allergies
- Each shows a list of records with name, details, status badge, dates
- Read-only for patients (providers add records from the patient detail page)
- Empty state per section: "No {conditions/medications/allergies} recorded" (neutral, informational tone)

## Shared Components to Build

**src/components/shared/EmptyState.tsx**
```tsx
interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: { label: string; href: string };
}
```

**src/components/shared/StatusBadge.tsx**
- Maps status values to badge colors using shadcn Badge + variants

**src/components/shared/StatCard.tsx** (used in Phase 2A but create skeleton now)
```tsx
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}
```

## Seed Data

Run the seed script after all CRUD pages are built. See docs/templates/seed-script.md for the full skeleton.

**scripts/seed.ts** — Create and run with `npx tsx scripts/seed.ts`

Seed data contents:
- 3 providers (Dr. Sarah Chen — Primary Care, Dr. James Wilson — Mental Health, Dr. Priya Patel — Cardiology)
- 1 admin user
- 12 patients with varied demographics
- 25 appointments spread across last 30 days + next 2 weeks, various statuses
- 15 clinical notes for completed appointments (realistic SOAP content)
- Medical records: ~20 records across patients (conditions like hypertension, diabetes; medications like metformin, lisinopril; allergies like penicillin, shellfish)
- Provider details: specialization, license numbers, bios
- Patient details: blood types, emergency contacts, insurance info

Demo credentials (set in docs/meta/project-info.md):
- provider@caresync.demo / Demo1234!
- patient@caresync.demo / Demo1234!
- admin@caresync.demo / Demo1234!

## Verification Checklist
- [ ] Provider can see patient list (populated from seed data)
- [ ] Provider can click into patient detail and see tabs with data
- [ ] Provider can view appointment list with correct statuses
- [ ] Provider can open appointment detail and create a SOAP clinical note
- [ ] Provider can mark appointment as complete or cancelled
- [ ] Patient can see their appointments list
- [ ] Patient can book a new appointment (select provider, date, type)
- [ ] Patient can view their health records
- [ ] Seed data populates all views with realistic data
- [ ] RLS enforced: patient cannot see other patients' data (test manually)
- [ ] `npm run build` passes

## Deploy Checkpoint: YES — first real version (auth + CRUD + data)
