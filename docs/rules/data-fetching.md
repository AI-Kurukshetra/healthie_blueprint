# Data Fetching Rules

## Server Actions vs API Routes
- Let the use case determine the approach
- **Server Actions**: Best for form submissions, CRUD mutations, simple data operations
- **API Routes**: Best for webhook endpoints, external API integrations, operations needing custom request/response handling
- For this project, Server Actions will cover most cases

## Server Action Pattern
```ts
// src/app/(dashboard)/provider/appointments/actions.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createAppointmentSchema } from '@/lib/validations/appointment';

export async function createAppointment(formData: FormData) {
  const supabase = await createServerClient();

  const parsed = createAppointmentSchema.safeParse({
    patient_id: formData.get('patient_id'),
    date_time: formData.get('date_time'),
    // ... other fields
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert(parsed.data)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/provider/appointments');
    return { success: true, data };
  } catch (e) {
    return { success: false, error: 'Failed to create appointment' };
  }
}
```

## Data Fetching in Server Components
```ts
// In a page.tsx (Server Component)
import { createServerClient } from '@/lib/supabase/server';

export default async function AppointmentsPage() {
  const supabase = await createServerClient();

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*, patient:profiles!patient_id(*), provider:profiles!provider_id(*)')
    .order('date_time', { ascending: true });

  if (error) throw new Error(error.message); // caught by error.tsx

  return <AppointmentList appointments={appointments ?? []} />;
}
```

## Query Files (optional — use when queries are reused)
```ts
// src/lib/queries/appointments.ts
import { createServerClient } from '@/lib/supabase/server';

export async function getUpcomingAppointments(userId: string) {
  const supabase = await createServerClient();
  return supabase
    .from('appointments')
    .select('*, patient:profiles!patient_id(*), provider:profiles!provider_id(*)')
    .or(`patient_id.eq.${userId},provider_id.eq.${userId}`)
    .gte('date_time', new Date().toISOString())
    .order('date_time', { ascending: true });
}
```

## Rules
- Always use `revalidatePath()` after mutations to refresh cached data
- Always handle the Supabase `error` return — don't assume success
- Use `.select()` after `.insert()` and `.update()` to return the created/updated row
- Use `.single()` when expecting exactly one row
- Use relationship queries (`select('*, relation:table!fk(*)')`) to avoid N+1 queries
- Never fetch data in `layout.tsx` that child pages also need — fetch at page level
