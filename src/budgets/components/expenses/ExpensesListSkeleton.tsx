import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card, CardContent } from "@/shared/components/ui/card";

export const ExpenseCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Mobile: Vertical, Desktop: Horizontal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Icon + Name + Date */}
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32 md:w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>

          {/* Right: Amount + Actions */}
          <div className="flex items-center justify-between md:justify-end gap-3 mt-2 md:mt-0">
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
