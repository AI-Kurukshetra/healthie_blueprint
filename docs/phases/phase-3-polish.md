# Phase 3 — Polish (~60 min)

## Goal
Make the product feel polished and complete. Skeleton loaders everywhere, empty states refined, responsive fixes, and one or two differentiating features. This is the version you demo.

## Non-Negotiable Polish (do these first)

### Skeleton Loaders (30 min budget for all)
Ensure every page with data fetching has a `loading.tsx` with skeletons matching the layout:

- `/provider/dashboard/loading.tsx` — 4 skeleton stat cards + skeleton table rows
- `/provider/patients/loading.tsx` — skeleton search bar + skeleton table
- `/provider/patients/[id]/loading.tsx` — skeleton header card + skeleton tabs
- `/provider/appointments/loading.tsx` — skeleton table
- `/provider/appointments/[id]/loading.tsx` — skeleton detail card + skeleton form
- `/provider/notes/loading.tsx` — skeleton table
- `/patient/dashboard/loading.tsx` — 3 skeleton stat cards + skeleton appointment card
- `/patient/appointments/loading.tsx` — skeleton card list
- `/patient/records/loading.tsx` — skeleton tabs + skeleton list
- `/admin/dashboard/loading.tsx` — 4 skeleton stat cards + skeleton table
- `/admin/users/loading.tsx` — skeleton search + skeleton table
- `/settings/loading.tsx` — skeleton form fields

Use shadcn `Skeleton` component. Match dimensions to actual content:
```tsx
// Example: stat cards skeleton
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {Array.from({ length: 4 }).map((_, i) => (
    <Card key={i} className="p-6">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-16" />
    </Card>
  ))}
</div>
```

### Empty States (review and refine)
Audit every list page. Ensure each has a proper EmptyState component with:
- Contextual Lucide icon
- Clear, neutral heading
- Helpful description
- Action CTA where appropriate

Medical context reminders:
- ✅ "No medical records on file" / "No appointments scheduled yet"
- ❌ "Nothing found!" / "Empty!" / "No records!"

### Inline Form Validation
Audit every form. Ensure:
- Zod + react-hook-form integration with `zodResolver`
- Error messages appear below each field: `text-sm text-destructive`
- Submit button disabled while `isSubmitting`
- Required fields have visual indicator (asterisk or "(required)" label)

Forms to check:
- Login form
- Signup form
- Book appointment form
- Clinical note SOAP form
- Settings/profile form
- Admin role change dialog
- Message send form

## Responsive Fixes (15 min)

Test every page at 375px width. Common issues to fix:

- **Tables**: If table columns overflow, either make the table horizontally scrollable (`overflow-x-auto`) or switch to card layout on mobile
- **Sidebar**: Verify Sheet (slide-in) works on mobile hamburger tap
- **Forms**: Ensure form fields are full-width on mobile
- **Stat cards**: Grid switches from 4-col to 2-col (`md`) to 1-col (mobile)
- **Landing page**: All sections stack properly, CTAs are tappable
- **Modals/Dialogs**: Full-width on mobile, proper padding

## Differentiating Features (remaining time)

Pick 1-2 based on remaining time. Ordered by impact-to-effort ratio:

### Option 1: Prescription Management (Simplified) — ~30 min
Add a `prescriptions` table:
```sql
CREATE TABLE public.prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) NOT NULL,
  provider_id UUID REFERENCES public.profiles(id) NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id),
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Add RLS policies (role-based pattern)
```

- Provider: "Write Prescription" button on appointment detail page
- Patient: "Prescriptions" nav item → list of their prescriptions
- Simple CRUD — no pharmacy integration, no drug interaction checking

### Option 2: Appointment Reminders / Notifications — ~20 min
- Add a `notifications` table
- When appointment is created, insert a notification for both patient and provider
- Bell icon in header with unread count badge
- Dropdown showing recent notifications
- Mark as read on click

### Option 3: Dashboard Chart — ~15 min
If not done in Phase 2A:
- Provider: bar chart of appointments per day (last 7 days)
- Admin: line chart of signups per week (last 4 weeks)
- `npm install recharts`
- Client Component wrapper, data passed from Server Component

### Option 4: Dark Mode — ~10 min
- `npm install next-themes`
- Add `ThemeProvider` to root layout
- Add theme toggle button in header (Sun/Moon icons)
- shadcn components auto-adapt

### Option 5: Export — ~15 min
- Provider: "Export Patient List" button → generates CSV
- Admin: "Export Users" button → generates CSV
- Client-side CSV generation (no server needed)

## Error Boundaries (final check)

Verify these files exist and render properly:
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/(dashboard)/error.tsx`
- `src/app/(auth)/error.tsx`
- Dynamic route `not-found.tsx` files for `[id]` routes

## Final Build Verification

Before merging Phase 3:
```bash
npm run build
```
Must pass with zero errors.

Then do a full manual walkthrough:
1. Visit landing page → looks good, CTAs work
2. Sign up new user → onboarding → dashboard
3. Log in as demo provider → dashboard shows stats → view patients → view appointment → write note
4. Log in as demo patient → dashboard shows next appointment → book new appointment → view records
5. Log in as demo admin → see all users → change a role
6. Test on mobile (375px) → sidebar collapses, pages are usable
7. Check for console errors in browser dev tools

## Verification Checklist
- [ ] Every data page has skeleton loader in loading.tsx
- [ ] Every list page has proper empty state
- [ ] Every form has inline Zod validation errors
- [ ] Mobile responsive: tested at 375px, no overflow, sidebar works
- [ ] At least 1 differentiating feature implemented
- [ ] Error boundaries in place
- [ ] `npm run build` passes with zero errors
- [ ] Full manual walkthrough completed successfully
- [ ] No console errors on core flows

## Deploy Checkpoint: YES — final build version, this is what you demo
