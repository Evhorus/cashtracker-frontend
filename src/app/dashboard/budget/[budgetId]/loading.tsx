import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ExpensesListSkeleton } from "@/budgets/components/expenses/ExpensesListSkeleton";

export default function BudgetDetailLoading() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Link href="/dashboard" className="pointer-events-none">
            <Button variant="ghost" size="icon" className="-ml-2" disabled>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-8 w-48 md:w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Desktop Actions Placeholder */}
        <div className="hidden md:flex gap-2 shrink-0">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      {/* Stats Grid - Top on all devices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
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
