import Link from "next/link";
import { CalendarX } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function PatientAppointmentNotFound() {
  return (
    <div className="space-y-4">
      <EmptyState
        action={{ href: "/patient/appointments", label: "Back to Appointments" }}
        description="The appointment may have been cancelled or is no longer available."
        icon={CalendarX}
        title="Appointment not found"
      />
      <div className="text-center">
        <Link className="text-sm text-muted-foreground underline-offset-4 hover:underline" href="/patient/dashboard">
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}
