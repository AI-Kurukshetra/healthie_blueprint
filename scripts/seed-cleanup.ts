import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function assertNoError(error: Error | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

async function run() {
  console.log("Starting demo data cleanup...");

  const { data: usersPage, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  assertNoError(usersError, "Unable to list auth users");

  const demoUsers = (usersPage?.users ?? []).filter((user) => user.email?.endsWith("@caresync.demo"));
  const demoUserIds = demoUsers.map((user) => user.id);

  if (demoUserIds.length === 0) {
    console.log("No demo users found. Cleanup complete.");
    return;
  }

  const { data: demoAppointments, error: appointmentLookupError } = await supabase
    .from("appointments")
    .select("id")
    .or(`provider_id.in.(${demoUserIds.join(",")}),patient_id.in.(${demoUserIds.join(",")})`);
  assertNoError(appointmentLookupError, "Unable to lookup demo appointments");

  const demoAppointmentIds = (demoAppointments ?? []).map((row) => row.id);

  if (demoAppointmentIds.length > 0) {
    const { error: messagesByApptError } = await supabase
      .from("messages")
      .delete()
      .in("appointment_id", demoAppointmentIds);
    assertNoError(messagesByApptError, "Unable to delete appointment-linked messages");
  }

  const { error: messagesByParticipantError } = await supabase
    .from("messages")
    .delete()
    .or(`sender_id.in.(${demoUserIds.join(",")}),receiver_id.in.(${demoUserIds.join(",")})`);
  assertNoError(messagesByParticipantError, "Unable to delete participant messages");

  if (demoAppointmentIds.length > 0) {
    const { error: notesByApptError } = await supabase
      .from("clinical_notes")
      .delete()
      .in("appointment_id", demoAppointmentIds);
    assertNoError(notesByApptError, "Unable to delete appointment-linked notes");
  }

  const { error: notesByParticipantError } = await supabase
    .from("clinical_notes")
    .delete()
    .or(`provider_id.in.(${demoUserIds.join(",")}),patient_id.in.(${demoUserIds.join(",")})`);
  assertNoError(notesByParticipantError, "Unable to delete participant notes");

  const { error: medicalRecordsError } = await supabase
    .from("medical_records")
    .delete()
    .in("patient_id", demoUserIds);
  assertNoError(medicalRecordsError, "Unable to delete medical records");

  const { error: availabilityError } = await supabase
    .from("availability")
    .delete()
    .in("provider_id", demoUserIds);
  assertNoError(availabilityError, "Unable to delete availability");

  const { error: appointmentsError } = await supabase
    .from("appointments")
    .delete()
    .or(`provider_id.in.(${demoUserIds.join(",")}),patient_id.in.(${demoUserIds.join(",")})`);
  assertNoError(appointmentsError, "Unable to delete appointments");

  const { error: patientDetailsError } = await supabase
    .from("patient_details")
    .delete()
    .in("id", demoUserIds);
  assertNoError(patientDetailsError, "Unable to delete patient details");

  const { error: providerDetailsError } = await supabase
    .from("provider_details")
    .delete()
    .in("id", demoUserIds);
  assertNoError(providerDetailsError, "Unable to delete provider details");

  const { error: profilesError } = await supabase.from("profiles").delete().in("id", demoUserIds);
  assertNoError(profilesError, "Unable to delete profiles");

  for (const user of demoUsers) {
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);
    assertNoError(deleteUserError, `Unable to delete auth user ${user.email}`);
  }

  console.log(`Deleted ${demoUsers.length} demo users and related records.`);
}

run().catch((error) => {
  console.error("Demo data cleanup failed:", error);
  process.exitCode = 1;
});
