import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-2 h-9 w-full max-w-48" />
        <Skeleton className="h-5 w-full max-w-64" />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/50 p-6">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-3 h-10 w-56" />
        <Skeleton className="mt-4 h-1.5 w-full rounded-full" />
        <div className="mt-3 flex justify-between">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      <Skeleton className="h-16 w-full rounded-xl" />
    </div>
  );
}
