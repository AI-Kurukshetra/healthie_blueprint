import { createClient, type AuthError, type User } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

interface AppointmentInsertRow {
  date_time: string;
  duration_minutes: number;
  notes: string | null;
  patient_id: string;
  provider_id: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  type: "initial" | "follow_up" | "consultation";
}

interface AppointmentSeedRow {
  id: string;
  patient_id: string;
  provider_id: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
}

interface ProviderSeed {
  bio: string;
  email: string;
  fullName: string;
  licenseNumber: string;
  specialization: string;
}

function assertNoError(error: AuthError | Error | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

async function createUser(email: string, password: string, fullName: string): Promise<User> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    password,
    user_metadata: { full_name: fullName },
  });

  if (error && !error.message.includes("already been registered")) {
    throw error;
  }

  if (data.user) {
    return data.user;
  }

  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  assertNoError(listError, `Unable to list users while resolving ${email}`);

  const existingUser = listData.users.find((user) => user.email === email);

  if (!existingUser) {
    throw new Error(`Failed to create or locate existing user for ${email}`);
  }

  return existingUser;
}

function randomFromArray<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

async function seed() {
  console.log("Starting seed...");

  const providersToSeed: ProviderSeed[] = [
    {
      bio: "Board-certified primary care physician with 10+ years supporting virtual-first clinics.",
      email: "provider@caresync.demo",
      fullName: "Dr. Sarah Chen",
      licenseNumber: "MD-2024-001",
      specialization: "Primary Care",
    },
    {
      bio: "Licensed psychiatrist specializing in anxiety, depression, and stress management.",
      email: "provider2@caresync.demo",
      fullName: "Dr. James Wilson",
      licenseNumber: "MD-2024-002",
      specialization: "Mental Health",
    },
    {
      bio: "Cardiologist focused on preventive heart health and remote patient monitoring.",
      email: "provider3@caresync.demo",
      fullName: "Dr. Priya Patel",
      licenseNumber: "MD-2024-003",
      specialization: "Cardiology",
    },
  ];

  const providerUsers = await Promise.all(
    providersToSeed.map((provider) => createUser(provider.email, "Demo1234!", provider.fullName))
  );
  const adminUser = await createUser("admin@caresync.demo", "Demo1234!", "Alex Admin");
  const primaryPatientUser = await createUser("patient@caresync.demo", "Demo1234!", "Jordan Smith");

  const additionalPatientNames = [
    "Emily Johnson",
    "Michael Brown",
    "Sarah Davis",
    "Robert Miller",
    "Jennifer Garcia",
    "William Martinez",
    "Amanda Anderson",
    "David Taylor",
    "Jessica Thomas",
    "Christopher Lee",
    "Ashley White",
  ];

  const extraPatientUsers = await Promise.all(
    additionalPatientNames.map((name, index) => createUser(`patient${index + 2}@caresync.demo`, "Demo1234!", name))
  );
  const patientUsers = [primaryPatientUser, ...extraPatientUsers];

  console.log("Users created");

  for (const providerUser of providerUsers) {
    const { error } = await supabase
      .from("profiles")
      .update({ phone: "555-0100", role: "provider" })
      .eq("id", providerUser.id);
    assertNoError(error, `Unable to assign provider role for ${providerUser.id}`);
  }

  for (const patientUser of patientUsers) {
    const { error } = await supabase
      .from("profiles")
      .update({ phone: "555-0200", role: "patient" })
      .eq("id", patientUser.id);
    assertNoError(error, `Unable to assign patient role for ${patientUser.id}`);
  }

  const { error: adminRoleError } = await supabase.from("profiles").update({ role: "admin" }).eq("id", adminUser.id);
  assertNoError(adminRoleError, "Unable to assign admin role");

  console.log("Roles assigned");

  const { error: providerDetailsError } = await supabase.from("provider_details").upsert(
    providersToSeed.map((provider, index) => ({
      bio: provider.bio,
      id: providerUsers[index].id,
      license_number: provider.licenseNumber,
      specialization: provider.specialization,
    }))
  );
  assertNoError(providerDetailsError, "Unable to upsert provider details");

  const patientDetailsSeed = [
    {
      blood_type: "O+",
      emergency_contact: "Jane Smith - 555-0300",
      id: patientUsers[0].id,
      insurance_id: "BC-123456",
      insurance_provider: "Blue Cross",
    },
    {
      blood_type: "A-",
      emergency_contact: "Tom Johnson - 555-0301",
      id: patientUsers[1].id,
      insurance_id: "AE-789012",
      insurance_provider: "Aetna",
    },
    {
      blood_type: "B+",
      emergency_contact: "Lisa Brown - 555-0302",
      id: patientUsers[2].id,
      insurance_id: "UH-345678",
      insurance_provider: "United Health",
    },
    {
      blood_type: "AB+",
      emergency_contact: "Mark Davis - 555-0303",
      id: patientUsers[3].id,
      insurance_id: "KP-224466",
      insurance_provider: "Kaiser Permanente",
    },
    {
      blood_type: "O-",
      emergency_contact: "Nina Taylor - 555-0304",
      id: patientUsers[4].id,
      insurance_id: "CT-998877",
      insurance_provider: "Cigna",
    },
  ];

  const { error: patientDetailsError } = await supabase.from("patient_details").upsert(patientDetailsSeed);
  assertNoError(patientDetailsError, "Unable to upsert patient details");

  console.log("Provider and patient details added");

  const appointmentTypes: AppointmentInsertRow["type"][] = ["initial", "follow_up", "consultation"];
  const pastStatuses: AppointmentInsertRow["status"][] = ["completed", "completed", "cancelled", "no_show"];
  const appointmentDurations = [15, 30, 30, 45, 60];
  const appointmentsToInsert: AppointmentInsertRow[] = [];

  for (let index = 0; index < 25; index += 1) {
    const dayOffset = Math.floor(Math.random() * 44) - 30;
    const hour = 9 + Math.floor(Math.random() * 8);
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + dayOffset);
    appointmentDate.setHours(hour, 0, 0, 0);

    const status: AppointmentInsertRow["status"] = dayOffset < 0 ? randomFromArray(pastStatuses) : "scheduled";
    const type = randomFromArray(appointmentTypes);
    const patient = randomFromArray(patientUsers);
    const provider = randomFromArray(providerUsers);

    appointmentsToInsert.push({
      date_time: appointmentDate.toISOString(),
      duration_minutes: randomFromArray(appointmentDurations),
      notes: status === "scheduled" ? "Please join five minutes early for check-in." : null,
      patient_id: patient.id,
      provider_id: provider.id,
      status,
      type,
    });
  }

  const { data: insertedAppointments, error: appointmentsError } = await supabase
    .from("appointments")
    .insert(appointmentsToInsert)
    .select("id, provider_id, patient_id, status");
  assertNoError(appointmentsError, "Unable to insert appointments");

  const createdAppointments = (insertedAppointments ?? []) as AppointmentSeedRow[];
  console.log(`${createdAppointments.length} appointments created`);

  const completedAppointments = createdAppointments.filter((appointment) => appointment.status === "completed");

  const clinicalNotesToInsert = completedAppointments.slice(0, 15).map((appointment) => ({
    appointment_id: appointment.id,
    assessment: "Condition remains stable with no acute concerns. Current treatment approach remains appropriate.",
    objective:
      "Vitals reviewed and within expected range. Patient appears comfortable, alert, and oriented during virtual visit.",
    patient_id: appointment.patient_id,
    plan: "Continue current plan, maintain lifestyle recommendations, and follow up in four weeks.",
    provider_id: appointment.provider_id,
    subjective: "Patient reports steady progress and good adherence to medications and self-care recommendations.",
  }));

  if (clinicalNotesToInsert.length > 0) {
    const { error: clinicalNotesError } = await supabase.from("clinical_notes").insert(clinicalNotesToInsert);
    assertNoError(clinicalNotesError, "Unable to insert clinical notes");
  }

  console.log(`${clinicalNotesToInsert.length} clinical notes created`);

  const medicalRecordsToInsert = [
    {
      details: "Stage 1, controlled on ACE inhibitor.",
      name: "Hypertension",
      patient_id: patientUsers[0].id,
      start_date: "2024-03-15",
      status: "active",
      type: "condition",
    },
    {
      details: "10mg once daily in the morning.",
      name: "Lisinopril",
      patient_id: patientUsers[0].id,
      start_date: "2024-03-15",
      status: "active",
      type: "medication",
    },
    {
      details: "History of rash and hives.",
      name: "Penicillin",
      patient_id: patientUsers[0].id,
      start_date: "2020-01-01",
      status: "active",
      type: "allergy",
    },
    {
      details: "Managed with diet and oral medication.",
      name: "Type 2 Diabetes",
      patient_id: patientUsers[1].id,
      start_date: "2023-06-01",
      status: "active",
      type: "condition",
    },
    {
      details: "500mg twice daily with meals.",
      name: "Metformin",
      patient_id: patientUsers[1].id,
      start_date: "2023-06-01",
      status: "active",
      type: "medication",
    },
    {
      details: "Prior anaphylactic reaction.",
      name: "Shellfish",
      patient_id: patientUsers[1].id,
      start_date: "2019-01-01",
      status: "active",
      type: "allergy",
    },
    {
      details: "Generalized anxiety, improved with therapy.",
      name: "Anxiety Disorder",
      patient_id: patientUsers[2].id,
      start_date: "2024-01-10",
      status: "active",
      type: "condition",
    },
    {
      details: "50mg once daily.",
      name: "Sertraline",
      patient_id: patientUsers[2].id,
      start_date: "2024-02-01",
      status: "active",
      type: "medication",
    },
    {
      details: "Mild intermittent asthma.",
      name: "Asthma",
      patient_id: patientUsers[3].id,
      start_date: "2022-09-01",
      status: "active",
      type: "condition",
    },
    {
      details: "Use as needed for wheezing or shortness of breath.",
      name: "Albuterol Inhaler",
      patient_id: patientUsers[3].id,
      start_date: "2022-09-01",
      status: "active",
      type: "medication",
    },
    {
      details: "Seasonal flares in spring and fall.",
      name: "Seasonal Allergic Rhinitis",
      patient_id: patientUsers[4].id,
      start_date: "2021-04-01",
      status: "active",
      type: "condition",
    },
    {
      details: "Severe skin reaction documented.",
      name: "Sulfa Drugs",
      patient_id: patientUsers[4].id,
      start_date: "2018-05-01",
      status: "active",
      type: "allergy",
    },
    {
      details: "Resolved after antibiotics and follow-up.",
      end_date: "2024-11-15",
      name: "Acute Bronchitis",
      patient_id: patientUsers[0].id,
      start_date: "2024-11-01",
      status: "resolved",
      type: "condition",
    },
    {
      details: "Completed 10-day course.",
      end_date: "2025-01-15",
      name: "Amoxicillin",
      patient_id: patientUsers[1].id,
      start_date: "2025-01-05",
      status: "discontinued",
      type: "medication",
    },
    {
      details: "Intermittent migraine without aura.",
      name: "Migraine",
      patient_id: patientUsers[5].id,
      start_date: "2023-09-10",
      status: "active",
      type: "condition",
    },
    {
      details: "Take one tablet at migraine onset.",
      name: "Sumatriptan 50mg",
      patient_id: patientUsers[5].id,
      start_date: "2023-09-10",
      status: "active",
      type: "medication",
    },
    {
      details: "Elevated LDL, managed with statin therapy.",
      name: "Hyperlipidemia",
      patient_id: patientUsers[6].id,
      start_date: "2022-05-22",
      status: "active",
      type: "condition",
    },
    {
      details: "20mg nightly.",
      name: "Atorvastatin",
      patient_id: patientUsers[6].id,
      start_date: "2022-05-22",
      status: "active",
      type: "medication",
    },
    {
      details: "Mild urticaria reaction.",
      name: "Ibuprofen",
      patient_id: patientUsers[7].id,
      start_date: "2021-08-30",
      status: "active",
      type: "allergy",
    },
    {
      details: "Recurrent eczema on hands.",
      name: "Atopic Dermatitis",
      patient_id: patientUsers[8].id,
      start_date: "2020-02-14",
      status: "active",
      type: "condition",
    },
  ];

  const { error: medicalRecordsError } = await supabase.from("medical_records").insert(medicalRecordsToInsert);
  assertNoError(medicalRecordsError, "Unable to insert medical records");

  console.log(`${medicalRecordsToInsert.length} medical records created`);

  const availabilityToInsert = providerUsers.flatMap((providerUser) => {
    return [1, 2, 3, 4, 5].map((dayOfWeek) => ({
      day_of_week: dayOfWeek,
      end_time: "17:00",
      is_active: true,
      provider_id: providerUser.id,
      start_time: "09:00",
    }));
  });

  const { error: availabilityError } = await supabase.from("availability").insert(availabilityToInsert);
  assertNoError(availabilityError, "Unable to insert provider availability");

  console.log("Provider availability set");
  console.log("Seed complete.");
  console.log("Provider: provider@caresync.demo / Demo1234!");
  console.log("Patient: patient@caresync.demo / Demo1234!");
  console.log("Admin: admin@caresync.demo / Demo1234!");
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
