import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderScheduleLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-10 w-96" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton className="h-28 w-full" key={index} />
        ))}
      </div>
    </div>
  );
}
