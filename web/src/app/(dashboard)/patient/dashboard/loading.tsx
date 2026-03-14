import { Skeleton } from "@/components/ui/skeleton";

export default function PatientDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Skeleton className="h-52 w-full lg:col-span-3" />
        <Skeleton className="h-52 w-full lg:col-span-2" />
      </div>

      <Skeleton className="h-64 w-full" />
    </div>
  );
}
