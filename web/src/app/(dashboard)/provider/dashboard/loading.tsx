import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderDashboardLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-36 w-full" />
    </div>
  );
}
