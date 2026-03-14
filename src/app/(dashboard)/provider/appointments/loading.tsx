import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderAppointmentsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-44" />
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
