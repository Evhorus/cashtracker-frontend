import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

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

export const ExpensesListSkeleton = () => {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <ExpenseCardSkeleton key={i} />
      ))}
    </div>
  );
};
