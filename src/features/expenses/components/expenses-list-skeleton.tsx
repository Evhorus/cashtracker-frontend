import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const ExpenseCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Mobile: Vertical, Desktop: Horizontal */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          {/* Left: Icon + Name + Date */}
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32 md:w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>

          {/* Right: Amount + Actions */}
          <div className="mt-2 flex items-center justify-between gap-3 md:mt-0 md:justify-end">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ExpensesListSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <ExpenseCardSkeleton key={i} />
      ))}
    </div>
  );
};
