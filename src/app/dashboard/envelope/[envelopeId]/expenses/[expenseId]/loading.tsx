import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExpenseLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      {/* Header Skeleton */}
      <PageHeaderSkeleton />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info Column (2/3 width) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Expense Highlight Card Skeleton */}
          <Card className="overflow-hidden border-0 shadow-md">
            <CardContent className="p-8">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-32 rounded-full" />
                  </div>
                </div>
                <div className="space-y-2 pl-18 text-left sm:pl-0 md:text-right">
                  <Skeleton className="ml-auto h-4 w-20" />
                  <Skeleton className="ml-auto h-10 w-40" />
                </div>
              </div>

              <div className="mt-8 space-y-3 border-t border-border/50 pt-6">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>

          {/* Meta Info Skeleton */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column (1/3 width) */}
        <div className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="pt-6 pb-2">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div>
                <div className="mb-2 flex items-end justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="mt-2 ml-auto h-3 w-40" />
              </div>

              <div className="space-y-3 border-t border-border/50 pt-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-24 rounded-md" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
