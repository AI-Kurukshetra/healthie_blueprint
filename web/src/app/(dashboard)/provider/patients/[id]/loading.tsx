import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderPatientDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-44 w-full" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
