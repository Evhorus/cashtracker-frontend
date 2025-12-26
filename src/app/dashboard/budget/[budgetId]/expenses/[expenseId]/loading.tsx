import { PageHeaderSkeleton } from "@/shared/components/PageHeaderSkeleton";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function ExpenseLoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Header Skeleton */}
      <PageHeaderSkeleton />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Expense Highlight Card Skeleton */}
          <Card className="overflow-hidden border-0 shadow-md">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-32 rounded-full" />
                  </div>
                </div>
                <div className="text-left md:text-right pl-18 sm:pl-0 space-y-2">
                  <Skeleton className="h-4 w-20 ml-auto" />
                  <Skeleton className="h-10 w-40 ml-auto" />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/50 space-y-3">
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
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            <CardHeader className="pb-2 pt-6">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="h-3 w-40 ml-auto mt-2" />
              </div>

              <div className="pt-4 border-t border-border/50 space-y-3">
                <div className="flex justify-between items-center">
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
