---
name: clinical-notes
description: |
  Use when building clinical documentation features: SOAP notes, medical records,
  patient health profiles, or any healthcare-specific data entry. Covers the SOAP
  format, medical terminology, and healthcare UX conventions. Trigger on "SOAP",
  "clinical note", "medical record", "patient chart". Do NOT use for generic CRUD.
---

# Clinical Notes — CareSync Healthcare Conventions

## SOAP Note Structure

Clinical notes follow the SOAP format — the standard for medical documentation:

| Section | Purpose | Example Content |
|---------|---------|-----------------|
| **S**ubjective | Patient's reported symptoms and history | "Patient reports persistent headache for 3 days, rated 7/10" |
| **O**bjective | Provider's clinical findings and measurements | "BP: 130/85, HR: 78, Temp: 98.6°F. No neurological deficits." |
| **A**ssessment | Diagnosis or clinical impression | "Tension-type headache, likely stress-related" |
| **P**lan | Treatment plan and follow-up | "Ibuprofen 400mg PRN, stress management referral, follow-up in 2 weeks" |

## Database Schema

```sql
CREATE TABLE public.clinical_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) NOT NULL,
  provider_id UUID REFERENCES public.profiles(id) NOT NULL,
  patient_id UUID REFERENCES public.profiles(id) NOT NULL,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'signed', 'amended')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## UI Pattern

```tsx
// Four textareas, each with a descriptive label
<div className="space-y-6">
  <FormField name="subjective" label="Subjective"
    placeholder="Patient's reported symptoms, history, and concerns..." />
  <FormField name="objective" label="Objective"
    placeholder="Clinical findings, vitals, examination results..." />
  <FormField name="assessment" label="Assessment"
    placeholder="Diagnosis, clinical impression..." />
  <FormField name="plan" label="Plan"
    placeholder="Treatment plan, medications, follow-up..." />
</div>
```

Each textarea should be sizeable (`min-h-[120px]`) — providers write detailed notes.

## Access Control

- **Providers**: Can create and edit their own notes. Cannot edit other providers' notes.
- **Patients**: Can view notes linked to their appointments. Cannot edit.
- **Admins**: Can view all notes. Cannot edit.

## Medical UX Rules

1. **Never allow deletion** of clinical notes — only editing (medical records must be preserved)
2. **Confirmation dialog** before editing a signed note — changes should be intentional
3. **Track amendments** — when a signed note is edited, update `status` to `'amended'` and record `updated_at`
4. **Neutral language** in empty states: "No clinical notes found" not "Nothing here!"
5. **Note status badges**: Draft (yellow), Signed (green), Amended (blue)
6. **Link to appointment** — every note is tied to a specific appointment
7. **Show provider name** on each note — patients need to know who wrote it

## Seed Data Examples

Generate realistic but fictional SOAP notes with:
- Varied chief complaints (headache, follow-up, annual physical, anxiety, back pain)
- Realistic vitals and measurements
- Common diagnoses
- Actionable treatment plans
- Mix of draft and signed statuses

## Validation Schema

```ts
export const clinicalNoteSchema = z.object({
  appointment_id: z.string().uuid(),
  subjective: z.string().min(1, "Subjective section is required").max(5000),
  objective: z.string().min(1, "Objective section is required").max(5000),
  assessment: z.string().min(1, "Assessment is required").max(5000),
  plan: z.string().min(1, "Plan is required").max(5000),
});
```
