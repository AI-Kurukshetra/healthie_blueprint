import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardRootLoading() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-72" />
      <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </main>
  );
}
