import { Skeleton } from "@/shared/components/ui/skeleton";

export default function ExpensesLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="w-full sm:w-auto">
          <Skeleton className="mb-2 h-9 w-full max-w-40" />
          <Skeleton className="h-5 w-full max-w-72" />
        </div>
        <Skeleton className="h-9 w-full sm:w-72" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-9 w-full max-w-md" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}
