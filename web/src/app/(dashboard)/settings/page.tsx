import { redirect } from "next/navigation";
import { SettingsForms } from "@/components/shared/SettingsForms";
import { createServerClient } from "@/lib/supabase/server";
import { profileRoleSchema, type ProfileRole } from "@/lib/validations/profile";

interface ProfileRow {
  avatar_url: string | null;
  email: string | null;
  full_name: string | null;
  id: string;
  phone: string | null;
  role: string | null;
}

interface ProviderDetailsRow {
  bio: string | null;
  license_number: string | null;
  specialization: string | null;
}

interface PatientDetailsRow {
  blood_type: string | null;
  emergency_contact: string | null;
  insurance_id: string | null;
  insurance_provider: string | null;
}

export default async function SettingsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, avatar_url, role")
    .eq("id", user.id)
    .single<ProfileRow>();

  if (profileError || !profile) {
    throw new Error(profileError?.message ?? "Unable to load profile");
  }

  const parsedRole = profileRoleSchema.safeParse(profile.role);
  if (!parsedRole.success) {
    throw new Error("Invalid role on profile");
  }

  const role: ProfileRole = parsedRole.data;

  let providerDetails: ProviderDetailsRow | null = null;
  let patientDetails: PatientDetailsRow | null = null;

  if (role === "provider") {
    const { data, error } = await supabase
      .from("provider_details")
      .select("specialization, license_number, bio")
      .eq("id", user.id)
      .maybeSingle<ProviderDetailsRow>();

    if (error) {
      throw new Error(error.message);
    }

    providerDetails = data ?? null;
  }

  if (role === "patient") {
    const { data, error } = await supabase
      .from("patient_details")
      .select("blood_type, emergency_contact, insurance_provider, insurance_id")
      .eq("id", user.id)
      .maybeSingle<PatientDetailsRow>();

    if (error) {
      throw new Error(error.message);
    }

    patientDetails = data ?? null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, role-specific details, and account settings.</p>
      </div>

      <SettingsForms
        patientDetails={patientDetails}
        profile={{
          avatar_url: profile.avatar_url,
          email: profile.email || user.email || "",
          full_name: profile.full_name,
          phone: profile.phone,
        }}
        providerDetails={providerDetails}
        role={role}
      />
    </div>
  );
}
