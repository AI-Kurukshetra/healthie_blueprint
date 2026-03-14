# Phase 2A — Dashboard Stats (~45 min)

## Goal
Replace placeholder dashboards with real data-driven views. Each role gets a dashboard with summary stats, recent activity, and quick actions. This is where the app starts feeling like a real product.

## Provider Dashboard — `/provider/dashboard`

### Stat Cards (top row, 4 cards)
1. **Total Patients** — count of distinct patients from this provider's appointments
2. **Today's Appointments** — count of appointments for today
3. **This Week** — count of appointments for the current week
4. **Pending Notes** — count of completed appointments that don't have a clinical note yet

Use the StatCard component created in Phase 1C. Each card: icon + label + value + optional trend description.

### Upcoming Appointments (below stats)
- Table or card list showing next 5 upcoming appointments
- Columns: patient name, time, type
- "View All" link → `/provider/appointments`

### Recent Clinical Notes
- List of last 5 clinical notes by this provider
- Shows: patient name, date, first line of subjective
- "View All" link → `/provider/notes`

### Quick Actions
- "View Today's Schedule" button
- "Search Patients" button (links to patients page)

## Patient Dashboard — `/patient/dashboard`

### Stat Cards (top row, 3 cards)
1. **Upcoming Appointments** — count of future scheduled appointments
2. **Completed Visits** — total completed appointments
3. **Active Conditions** — count of active medical records (type='condition', status='active')

### Next Appointment (prominent card)
- If upcoming appointment exists: show provider name, date/time, type, "View Details" button
- If none: show "No upcoming appointments" with "Book Now" CTA

### Health Summary
- Quick view of active conditions, current medications, known allergies
- Shows count badges: "3 conditions · 2 medications · 1 allergy"
- "View Full Records" link → `/patient/records`

### Recent Activity
- Last 3-4 completed appointments with dates
- Any recent messages (if Tier 2 messaging is built)

## Admin Dashboard — `/admin/dashboard`

### Stat Cards (top row, 4 cards)
1. **Total Users** — count of all profiles
2. **Providers** — count where role='provider'
3. **Patients** — count where role='patient'
4. **Appointments Today** — count of all appointments for today

### Recent Signups
- Table of last 10 users who signed up
- Columns: name, email, role, signup date
- "View All Users" link → `/admin/users`

### System Activity
- Recent appointments created
- Recent notes written
- Simple activity feed showing last 10 actions across the platform

## Data Fetching Approach

Each dashboard page is a Server Component. Fetch all data server-side:

```ts
// Example: Provider dashboard data
const supabase = await createServerClient();
const { data: { user } } = await supabase.auth.getUser();

// Total patients (distinct from appointments)
const { count: patientCount } = await supabase
  .from('appointments')
  .select('patient_id', { count: 'exact', head: true })
  .eq('provider_id', user.id);

// Today's appointments
const today = new Date().toISOString().split('T')[0];
const { count: todayCount } = await supabase
  .from('appointments')
  .select('*', { count: 'exact', head: true })
  .eq('provider_id', user.id)
  .gte('date_time', `${today}T00:00:00`)
  .lte('date_time', `${today}T23:59:59`);

// ... etc
```

Consider creating query helper functions in `src/lib/queries/dashboard.ts` if queries are complex or reused.

## Optional: Simple Chart
If time permits within this phase, add one chart to the provider dashboard:
- Appointments per day for the last 7 days (bar chart)
- Use Recharts: `npm install recharts` (or skip if time is tight)
- This is a Client Component wrapping the chart, receiving data as props from the Server Component

## Verification Checklist
- [ ] Provider dashboard shows correct stat counts from seed data
- [ ] Provider sees upcoming appointments and recent notes
- [ ] Patient dashboard shows their upcoming appointment prominently
- [ ] Patient health summary shows correct counts
- [ ] Admin dashboard shows system-wide user and appointment counts
- [ ] All dashboards have loading.tsx with skeleton matching the layout
- [ ] Stats update after creating new appointments or notes
- [ ] `npm run build` passes

## Deploy Checkpoint: NO — deploy after 2B (combined Tier 2 deploy)
