# Phase 2B — Secondary Features (~45 min)

## Goal
Add search/filtering, messaging, user management (admin), and settings page. After this phase, the product feels competitive — not just functional, but useful.

## Provider — Patient Search & Filter

### Update `/provider/patients/page.tsx`
- Add search input at top of page: searches by patient name or email
- Filter dropdown: "All patients" / "Active" (has upcoming appointment) / "Inactive" (no upcoming)
- Search is implemented server-side via Supabase `.ilike()` query
- Make this a Client Component wrapper that passes filters to a Server Action or uses URL search params:

```ts
// URL params approach (preferred — preserves state on refresh)
// /provider/patients?search=john&filter=active
const searchParams = useSearchParams();
const search = searchParams.get('search') ?? '';
const filter = searchParams.get('filter') ?? 'all';
```

Alternatively, keep the page as Server Component and read search params from the page props:
```ts
export default async function PatientsPage({
  searchParams,
}: {
  searchParams: { search?: string; filter?: string };
}) {
  // Query with filters
}
```

## Provider — Schedule / Availability

### `/provider/schedule/page.tsx`
- Simple availability management
- Table showing days of the week (Mon–Fri by default)
- Each day: start time, end time, active toggle (Switch component)
- Save button → Server Action updates `availability` table
- This feeds into the patient booking flow (show only available slots)

Keep this simple — a form with 5-7 rows (one per weekday), each with two time inputs and a switch.

## Patient — Secure Messaging (Simplified)

### `/patient/messages/page.tsx`
- List of conversations (grouped by provider)
- Click provider → shows message thread
- Simple chat-style UI: messages listed chronologically, input at bottom
- Messages stored in `messages` table with sender_id, receiver_id, content, read_at

### Message Components
**src/components/shared/MessageThread.tsx** — Client Component
- Displays messages in a scrollable container
- Current user's messages right-aligned (blue), other's left-aligned (gray)
- Input field + send button at bottom
- On send: Server Action inserts message, revalidates

**Provider side**: Add a "Messages" page at `/provider/messages/page.tsx` with same component, filtered to show conversations with their patients.

Keep the messaging very simple — no real-time updates (no WebSockets). Just refresh-based or revalidation-based. A "Refresh" button or auto-revalidation every 30 seconds via Client Component polling is sufficient.

## Admin — User Management

### `/admin/users/page.tsx`
- Server Component: fetch all profiles
- Table: name, email, role, signup date, status
- Role shown as Badge (patient=blue, provider=green, admin=purple)
- Search by name or email (same pattern as provider patients search)
- Actions dropdown per row:
  - View profile
  - Change role (opens Dialog with role Select — use confirmation)
  - Deactivate (soft delete — set a `is_active` flag if you've added one, or just show as placeholder)

### Server Action
```ts
// src/app/(dashboard)/admin/users/actions.ts
export async function updateUserRole(userId: string, newRole: 'patient' | 'provider' | 'admin') {
  // Validate current user is admin
  // Update profiles.role
  // Revalidate path
}
```

## Shared — Settings Page

### `/settings/page.tsx`
All roles share this page. Server Component fetching current profile.

**Profile Section**
- Full name (editable)
- Email (read-only, shown but not editable)
- Phone (editable)
- Avatar URL (editable text field — or skip avatar upload for hackathon)
- Save button → Server Action updates profiles

**Role-Specific Section**
- If provider: show specialization, license number, bio fields (from provider_details)
- If patient: show blood type, emergency contact, insurance info (from patient_details)
- If admin: no extra fields

**Account Section**
- Change password (Supabase `updateUser({ password })`)
- Danger zone: placeholder "Delete Account" button (non-functional, just shows it's considered)

### Zod Schema
```ts
// src/lib/validations/profile.ts
export const updateProfileSchema = z.object({
  full_name: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

export const updateProviderDetailsSchema = z.object({
  specialization: z.string().max(100).optional(),
  license_number: z.string().max(50).optional(),
  bio: z.string().max(1000).optional(),
});

export const updatePatientDetailsSchema = z.object({
  blood_type: z.string().max(5).optional(),
  emergency_contact: z.string().max(200).optional(),
  insurance_provider: z.string().max(100).optional(),
  insurance_id: z.string().max(50).optional(),
});
```

## Toast Notifications (Add Now)

Since Sonner was installed in Phase 1A, now wire it up across the app:
- Success toast after: creating appointment, saving clinical note, updating profile, sending message
- Error toast when: Server Action returns `{ success: false }`
- Import `toast` from `sonner` in Client Components

## Verification Checklist
- [ ] Provider can search patients by name/email
- [ ] Provider can set weekly availability
- [ ] Patient can send a message to their provider
- [ ] Provider can view and reply to patient messages
- [ ] Admin can view all users in a table with search
- [ ] Admin can change a user's role (with confirmation)
- [ ] Settings page saves profile changes correctly per role
- [ ] Toast notifications appear on successful actions
- [ ] `npm run build` passes

## Deploy Checkpoint: YES — Tier 2 complete, competitive product
