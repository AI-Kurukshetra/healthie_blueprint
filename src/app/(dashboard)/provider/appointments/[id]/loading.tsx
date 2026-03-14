import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderAppointmentDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <div className="space-y-3">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-5 w-80" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-48" />
        </div>
      </div>
      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <div className="space-y-3">
          <Skeleton className="h-6 w-44" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
