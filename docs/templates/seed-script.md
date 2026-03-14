# Seed Script — Template & Rules

## File: `scripts/seed.ts`
Run with: `npx tsx scripts/seed.ts`

Requires: `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

## Script Skeleton

```ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createUser(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error && !error.message.includes('already been registered')) {
    throw error;
  }
  // If user already exists, look them up
  if (!data?.user) {
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const existing = users.find(u => u.email === email);
    return existing!;
  }
  return data.user;
}

async function seed() {
  console.log('🌱 Starting seed...');

  // 1. Create demo users
  const providerUser1 = await createUser('provider@caresync.demo', 'Demo1234!', 'Dr. Sarah Chen');
  const providerUser2 = await createUser('provider2@caresync.demo', 'Demo1234!', 'Dr. James Wilson');
  const providerUser3 = await createUser('provider3@caresync.demo', 'Demo1234!', 'Dr. Priya Patel');
  const adminUser = await createUser('admin@caresync.demo', 'Demo1234!', 'Alex Admin');
  const patientUser = await createUser('patient@caresync.demo', 'Demo1234!', 'Jordan Smith');

  // Create additional patients (10-12 total)
  const patientNames = [
    'Emily Johnson', 'Michael Brown', 'Sarah Davis', 'Robert Miller',
    'Jennifer Garcia', 'William Martinez', 'Amanda Anderson', 'David Taylor',
    'Jessica Thomas', 'Christopher Lee', 'Ashley White'
  ];
  const patients = [patientUser];
  for (let i = 0; i < patientNames.length; i++) {
    const email = `patient${i + 2}@caresync.demo`;
    const user = await createUser(email, 'Demo1234!', patientNames[i]);
    patients.push(user);
  }

  console.log('✅ Users created');

  // 2. Set roles in profiles
  const providers = [providerUser1, providerUser2, providerUser3];
  for (const p of providers) {
    await supabase.from('profiles').update({ role: 'provider', phone: '555-0100' }).eq('id', p.id);
  }
  for (const p of patients) {
    await supabase.from('profiles').update({ role: 'patient', phone: '555-0200' }).eq('id', p.id);
  }
  await supabase.from('profiles').update({ role: 'admin' }).eq('id', adminUser.id);

  console.log('✅ Roles assigned');

  // 3. Provider details
  await supabase.from('provider_details').upsert([
    { id: providerUser1.id, specialization: 'Primary Care', license_number: 'MD-2024-001', bio: 'Board-certified primary care physician with 10+ years of experience in virtual care.' },
    { id: providerUser2.id, specialization: 'Mental Health', license_number: 'MD-2024-002', bio: 'Licensed psychiatrist specializing in anxiety, depression, and stress management.' },
    { id: providerUser3.id, specialization: 'Cardiology', license_number: 'MD-2024-003', bio: 'Cardiologist focused on preventive heart health and remote monitoring.' },
  ]);

  // 4. Patient details (for demo patient and a few others)
  await supabase.from('patient_details').upsert([
    { id: patientUser.id, blood_type: 'O+', emergency_contact: 'Jane Smith - 555-0300', insurance_provider: 'Blue Cross', insurance_id: 'BC-123456' },
    { id: patients[1].id, blood_type: 'A-', emergency_contact: 'Tom Johnson - 555-0301', insurance_provider: 'Aetna', insurance_id: 'AE-789012' },
    { id: patients[2].id, blood_type: 'B+', emergency_contact: 'Lisa Brown - 555-0302', insurance_provider: 'United Health', insurance_id: 'UH-345678' },
  ]);

  console.log('✅ Provider and patient details added');

  // 5. Appointments (25 spread across last 30 days + next 2 weeks)
  const appointments = [];
  const statuses = ['completed', 'completed', 'completed', 'scheduled', 'scheduled'];
  const types = ['initial', 'follow_up', 'consultation'];

  for (let i = 0; i < 25; i++) {
    const daysOffset = Math.floor(Math.random() * 44) - 30; // -30 to +14
    const hour = 9 + Math.floor(Math.random() * 8); // 9am to 5pm
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    date.setHours(hour, 0, 0, 0);

    const status = daysOffset < 0 ? statuses[Math.floor(Math.random() * 3)] : 'scheduled';
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const provider = providers[Math.floor(Math.random() * providers.length)];

    appointments.push({
      patient_id: patient.id,
      provider_id: provider.id,
      date_time: date.toISOString(),
      duration_minutes: [15, 30, 30, 45, 60][Math.floor(Math.random() * 5)],
      status,
      type: types[Math.floor(Math.random() * types.length)],
      notes: status === 'scheduled' ? 'Please arrive 5 minutes early' : null,
    });
  }

  const { data: insertedAppts } = await supabase.from('appointments').insert(appointments).select();
  console.log(`✅ ${insertedAppts?.length} appointments created`);

  // 6. Clinical notes for completed appointments
  const completedAppts = insertedAppts?.filter(a => a.status === 'completed') ?? [];
  const soapNotes = completedAppts.slice(0, 15).map(appt => ({
    appointment_id: appt.id,
    provider_id: appt.provider_id,
    patient_id: appt.patient_id,
    subjective: 'Patient reports feeling well overall. No acute complaints. Following up on previous recommendations.',
    objective: 'Vital signs within normal limits. BP 120/80, HR 72, Temp 98.6F. General appearance is well.',
    assessment: 'Patient is in stable condition. Current treatment plan is effective. No new concerns identified.',
    plan: 'Continue current medications. Follow up in 4 weeks. Patient to monitor symptoms and contact if worsening.',
  }));

  await supabase.from('clinical_notes').insert(soapNotes);
  console.log(`✅ ${soapNotes.length} clinical notes created`);

  // 7. Medical records
  const medicalRecords = [
    { patient_id: patientUser.id, type: 'condition', name: 'Hypertension', details: 'Stage 1, well-controlled with medication', status: 'active', start_date: '2024-03-15' },
    { patient_id: patientUser.id, type: 'medication', name: 'Lisinopril 10mg', details: 'Once daily, morning', status: 'active', start_date: '2024-03-15' },
    { patient_id: patientUser.id, type: 'allergy', name: 'Penicillin', details: 'Rash and hives', status: 'active', start_date: '2020-01-01' },
    { patient_id: patients[1].id, type: 'condition', name: 'Type 2 Diabetes', details: 'Managed with diet and metformin', status: 'active', start_date: '2023-06-01' },
    { patient_id: patients[1].id, type: 'medication', name: 'Metformin 500mg', details: 'Twice daily with meals', status: 'active', start_date: '2023-06-01' },
    { patient_id: patients[1].id, type: 'allergy', name: 'Shellfish', details: 'Anaphylactic reaction', status: 'active', start_date: '2019-01-01' },
    { patient_id: patients[2].id, type: 'condition', name: 'Anxiety Disorder', details: 'Generalized anxiety, responding to therapy', status: 'active', start_date: '2024-01-10' },
    { patient_id: patients[2].id, type: 'medication', name: 'Sertraline 50mg', details: 'Once daily', status: 'active', start_date: '2024-02-01' },
    { patient_id: patients[3].id, type: 'condition', name: 'Asthma', details: 'Mild intermittent, uses rescue inhaler as needed', status: 'active', start_date: '2022-09-01' },
    { patient_id: patients[3].id, type: 'medication', name: 'Albuterol Inhaler', details: 'As needed for shortness of breath', status: 'active', start_date: '2022-09-01' },
    { patient_id: patients[4].id, type: 'condition', name: 'Seasonal Allergies', details: 'Spring and fall, managed with antihistamines', status: 'active', start_date: '2021-04-01' },
    { patient_id: patients[4].id, type: 'allergy', name: 'Sulfa Drugs', details: 'Severe skin reaction', status: 'active', start_date: '2018-05-01' },
    // Some resolved records
    { patient_id: patientUser.id, type: 'condition', name: 'Acute Bronchitis', details: 'Resolved after 2-week antibiotic course', status: 'resolved', start_date: '2024-11-01', end_date: '2024-11-15' },
    { patient_id: patients[1].id, type: 'medication', name: 'Amoxicillin 500mg', details: '10-day course for sinus infection', status: 'discontinued', start_date: '2025-01-05', end_date: '2025-01-15' },
  ];

  await supabase.from('medical_records').insert(medicalRecords);
  console.log(`✅ ${medicalRecords.length} medical records created`);

  // 8. Availability for providers
  const availability = [];
  for (const p of providers) {
    for (let day = 1; day <= 5; day++) { // Mon-Fri
      availability.push({
        provider_id: p.id,
        day_of_week: day,
        start_time: '09:00',
        end_time: '17:00',
        is_active: true,
      });
    }
  }
  await supabase.from('availability').insert(availability);
  console.log('✅ Provider availability set');

  console.log('\n🎉 Seed complete!');
  console.log('Demo accounts:');
  console.log('  Provider: provider@caresync.demo / Demo1234!');
  console.log('  Patient:  patient@caresync.demo / Demo1234!');
  console.log('  Admin:    admin@caresync.demo / Demo1234!');
}

seed().catch(console.error);
```

## Data Realism Rules
- Dates spread across 30 days past + 14 days future
- Mix of statuses (more completed in past, all scheduled in future)
- Medical data uses real condition/medication names
- SOAP notes have realistic but generic clinical language
- Not all patients have medical records (realistic — some are new)
- Appointment times during business hours only (9am-5pm)

## Running the Script
```bash
# Install tsx if not present
npm install -D tsx dotenv

# Run seed
npx tsx scripts/seed.ts
```

## Re-running
The script is designed to be idempotent — if users already exist, it looks them up instead of failing. Table data will be duplicated on re-run though. To fully reset: delete all rows from tables in Supabase SQL Editor, then re-run.
