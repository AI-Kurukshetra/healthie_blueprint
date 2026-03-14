import Link from "next/link";
import {
  Calendar,
  ClipboardList,
  Heart,
  LayoutDashboard,
  Lock,
  Shield,
  Stethoscope,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerClient } from "@/lib/supabase/server";

const features = [
  {
    title: "Smart Scheduling",
    description:
      "Patients book appointments online. Providers manage their schedule effortlessly. Automated reminders keep everyone on track.",
    icon: Calendar,
  },
  {
    title: "Clinical Documentation",
    description:
      "SOAP-formatted clinical notes linked to every appointment. Write, review, and manage documentation in seconds.",
    icon: ClipboardList,
  },
  {
    title: "Patient Portal",
    description:
      "Patients view their records, track appointments, and communicate with their care team - all from one dashboard.",
    icon: Heart,
  },
  {
    title: "Provider Dashboard",
    description:
      "At-a-glance view of today's appointments, patient queue, and clinical tasks. Built for efficiency.",
    icon: LayoutDashboard,
  },
  {
    title: "Role-Based Access",
    description:
      "Separate views for patients, providers, and administrators. Every user sees exactly what they need.",
    icon: Shield,
  },
  {
    title: "Secure by Design",
    description:
      "Row-level security on every table. HIPAA-aligned architecture. Your data stays yours.",
    icon: Lock,
  },
] as const;

const steps = [
  "Sign up and choose your role",
  "Set up your profile and availability",
  "Start managing appointments and patient care",
] as const;

const tech = ["Next.js", "Supabase", "Vercel", "TypeScript"] as const;

export default async function LandingPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dashboardHref = "/onboarding";
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role === "provider") dashboardHref = "/provider/dashboard";
    if (profile?.role === "patient") dashboardHref = "/patient/dashboard";
    if (profile?.role === "admin") dashboardHref = "/admin/dashboard";
  }

  return (
    <main className="bg-background">
      <section className="bg-gradient-to-b from-[#152640] to-[#1F3558] text-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-teal-500/20 p-2 text-teal-300">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">CareSync</span>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            {user ? (
              <Button asChild size="sm">
                <Link href={dashboardHref}>Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="sm" variant="secondary">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        {!user ? (
          <div className="mx-auto flex w-full max-w-6xl gap-2 px-6 pb-4 sm:hidden">
            <Button asChild className="w-full" size="sm" variant="secondary">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="w-full" size="sm">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-6xl px-6 pb-4 sm:hidden">
            <Button asChild className="w-full" size="sm">
              <Link href={dashboardHref}>Go to Dashboard</Link>
            </Button>
          </div>
        )}

        <div className="px-6 py-24">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2">
            <div className="space-y-6 text-center lg:text-left">
              <Badge className="border-transparent bg-white/15 text-white">Virtual-First Care Operations</Badge>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Modern EHR for Virtual-First Healthcare
                </h1>
                <p className="max-w-2xl text-base text-white/80 sm:text-lg">
                  Streamline appointments, clinical documentation, and patient care - all in one platform. A clean,
                  modern alternative to legacy EHR systems.
                </p>
              </div>
              <div className="flex w-full flex-col items-center gap-3 sm:flex-row lg:justify-start">
                {user ? (
                  <Button asChild className="w-full sm:w-auto" size="lg">
                    <Link href={dashboardHref}>Go to Dashboard</Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full sm:w-auto" size="lg">
                    <Link href="/signup">Get Started</Link>
                  </Button>
                )}
                <Button asChild className="w-full sm:w-auto" size="lg" variant="secondary">
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>

            <Card className="rounded-2xl bg-card text-card-foreground shadow-md">
              <CardHeader>
                <CardTitle>Operations Snapshot</CardTitle>
                <CardDescription>See your clinic&apos;s daily flow at a glance.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-muted/40 p-4">
                  <p className="text-sm text-muted-foreground">Today&apos;s Appointments</p>
                  <p className="mt-1 text-2xl font-semibold">24</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-4">
                  <p className="text-sm text-muted-foreground">Clinical Notes Pending</p>
                  <p className="mt-1 text-2xl font-semibold">7</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-4 sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Patient Portal Engagement</p>
                  <p className="mt-1 text-2xl font-semibold">91%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-24" id="features">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Everything your virtual clinic needs</h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Purpose-built for providers, patients, and care operations teams.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader className="space-y-3">
                  <div className="w-fit rounded-xl bg-primary/15 p-2 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 px-6 py-24">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Get started in 3 steps</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={step}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm text-primary">
                      {index + 1}
                    </span>
                    Step {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Built with modern, trusted technologies</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tech.map((item) => (
              <div key={item} className="rounded-xl bg-card px-4 py-3 text-center text-sm font-medium shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto w-full max-w-5xl rounded-2xl bg-card p-8 text-center shadow-sm sm:p-10">
          <h2 className="text-3xl font-semibold tracking-tight">Ready to modernize your practice?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Start with role-based workflows for providers, patients, and admins - built for modern virtual clinics.
          </p>
          <div className="mt-6 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <Button asChild className="w-full sm:w-auto" size="lg">
                <Link href={dashboardHref}>Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild className="w-full sm:w-auto" size="lg">
                  <Link href="/signup">Get Started for Free</Link>
                </Button>
                <Button asChild className="w-full sm:w-auto" size="lg" variant="secondary">
                  <Link href="/login">View Demo</Link>
                </Button>
              </>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Demo: provider@caresync.demo / Demo1234!</p>
        </div>
      </section>

      <footer className="bg-[#1B2B4B] px-6 py-10 text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">CareSync</p>
            <p className="text-xs text-white/70">Modern EHR for virtual-first healthcare teams</p>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-xs text-white/70">
            <Link href="#features">Features</Link>
            <Link href="#">About</Link>
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
          </nav>
        </div>
        <p className="mx-auto mt-6 w-full max-w-6xl text-xs text-white/70">Built with care for modern healthcare. © 2026 CareSync</p>
      </footer>
    </main>
  );
}
