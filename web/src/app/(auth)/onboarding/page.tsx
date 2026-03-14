import { Heart, Shield, Stethoscope } from "lucide-react";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerClient } from "@/lib/supabase/server";
import { setUserRole } from "./actions";

export default async function OnboardingPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (profile?.role === "provider") {
    redirect("/provider/dashboard");
  }

  if (profile?.role === "patient") {
    redirect("/patient/dashboard");
  }

  if (profile?.role === "admin") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 py-4">
      <div className="space-y-2 text-center">
        <Badge className="mx-auto" variant="secondary">
          Onboarding
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome to CareSync</h1>
        <p className="text-sm text-muted-foreground">Choose your role to personalize your dashboard and navigation.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="transition-colors hover:border-primary/40">
          <CardHeader className="space-y-3">
            <Heart className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Patient</CardTitle>
            <CardDescription>Book appointments and manage your health</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={setUserRole.bind(null, "patient")}>
              <Button className="w-full" type="submit" variant="outline">
                Continue as Patient
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="transition-colors hover:border-primary/40">
          <CardHeader className="space-y-3">
            <Stethoscope className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Provider</CardTitle>
            <CardDescription>Manage patients and clinical documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={setUserRole.bind(null, "provider")}>
              <Button className="w-full" type="submit" variant="outline">
                Continue as Provider
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="transition-colors hover:border-primary/40">
          <CardHeader className="space-y-3">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Admin</CardTitle>
            <CardDescription>Manage platform users and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={setUserRole.bind(null, "admin")}>
              <Button className="w-full" type="submit" variant="outline">
                Continue as Admin
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
