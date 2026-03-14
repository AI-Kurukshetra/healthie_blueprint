import Link from "next/link";
import { ArrowLeft, Stethoscope } from "lucide-react";
import { redirect } from "next/navigation";
import { BookAppointmentForm } from "@/components/patient/BookAppointmentForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerClient } from "@/lib/supabase/server";

interface ProviderProfileRow {
  full_name: string | null;
  id: string;
}

interface ProviderDetailsRow {
  bio: string | null;
  id: string;
  specialization: string | null;
}

export default async function NewPatientAppointmentPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: providerProfiles, error: profilesError }, { data: providerDetails, error: providerDetailsError }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name").eq("role", "provider").returns<ProviderProfileRow[]>(),
      supabase.from("provider_details").select("id, specialization, bio").returns<ProviderDetailsRow[]>(),
    ]);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  if (providerDetailsError) {
    throw new Error(providerDetailsError.message);
  }

  const providers = (providerProfiles ?? [])
    .map((providerProfile) => {
      const matchingDetails = (providerDetails ?? []).find((detail) => detail.id === providerProfile.id);

      return {
        bio: matchingDetails?.bio ?? null,
        id: providerProfile.id,
        name: providerProfile.full_name || "Care Provider",
        specialization: matchingDetails?.specialization ?? null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <Button asChild className="w-fit" variant="ghost">
        <Link href="/patient/appointments">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Appointments
        </Link>
      </Button>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Book Appointment</h1>
        <p className="text-sm text-muted-foreground">Choose a provider, pick a time, and share details for your visit.</p>
      </div>

      {providers.length === 0 ? (
        <EmptyState
          description="No providers are available yet. Please check back shortly."
          icon={Stethoscope}
          title="No providers available"
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>New Appointment Request</CardTitle>
          </CardHeader>
          <CardContent>
            <BookAppointmentForm providers={providers} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
