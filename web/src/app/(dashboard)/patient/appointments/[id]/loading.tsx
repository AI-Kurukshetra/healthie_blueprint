import { Skeleton } from "@/components/ui/skeleton";

export default function PatientAppointmentDetailsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
