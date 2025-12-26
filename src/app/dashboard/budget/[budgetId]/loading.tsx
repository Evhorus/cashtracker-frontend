import { PageHeaderSkeleton } from "@/shared/components/PageHeaderSkeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ExpensesListSkeleton } from "@/budgets/components/expenses/ExpensesListSkeleton";

export default function BudgetDetailLoading() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <PageHeaderSkeleton />

      {/* Stats Grid - Top on all devices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Card Skeleton */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>

        {/* Total Spent Card Skeleton */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>

        {/* Total Budget Card Skeleton */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Expenses List (Larger) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-row items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-10 w-10 md:w-40" />
          </div>
          <ExpensesListSkeleton />
        </div>

        {/* Right Column: Chart */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-32" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
