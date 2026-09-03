import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Mirrors ExpenseCard's real (compact, single-row) shape - was a
// taller two-row skeleton (stacked on mobile) that shrunk once real
// content mounted, an extra bit of layout shift the real page never has.
export const ExpenseCardSkeleton = () => {
  return (
    <Card size="sm" className="overflow-hidden">
      <CardContent className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32 md:w-48" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-4 w-16 shrink-0" />
        <Skeleton className="h-8 w-8 shrink-0 rounded-md md:hidden" />
      </CardContent>
    </Card>
  );
};

// Mirrors ExpensesTable's real shape (header row + 5 rows) - same
// mobile-card/desktop-table split as the real ExpensesList, so nothing
// changes shape once real content mounts on either breakpoint.
const ExpensesTableSkeleton = () => {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-border/60 bg-card/30 md:block">
      <div className="flex items-center gap-4 border-b border-border/60 bg-card/60 px-5 py-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="ml-auto h-3 w-14" />
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-10" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 border-b border-border/60 px-5 py-3.5 last:border-b-0"
        >
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="ml-auto h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
};

interface ExpensesListSkeletonProps {
  /** Mirrors ExpensesResults' own check - the filtered-total box stays
   * `invisible` (not unmounted) without an active search/date filter,
   * so its reserved height matches the real content exactly and the
   * list below never jumps between the skeleton and the real page, or
   * between a filtered and unfiltered result. */
  hasActiveFilter?: boolean;
}

export const ExpensesListSkeleton = ({
  hasActiveFilter = false,
}: ExpensesListSkeletonProps = {}) => {
  return (
    <>
      {/* Mirrors the filtered-total box in ExpensesResults - always
          mounted so the fallback's height matches the real content's,
          filter or no filter. */}
      <Skeleton
        className={cn(
          "mb-3 h-11 w-full rounded-lg sm:w-64",
          !hasActiveFilter && "invisible",
        )}
      />
      <div className="space-y-2 md:hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <ExpenseCardSkeleton key={i} />
        ))}
      </div>
      <ExpensesTableSkeleton />
    </>
  );
};
