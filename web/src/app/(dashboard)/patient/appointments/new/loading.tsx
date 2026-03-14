import { Skeleton } from "@/components/ui/skeleton";

export default function NewPatientAppointmentLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-56" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-[620px] w-full" />
    </div>
  );
}
