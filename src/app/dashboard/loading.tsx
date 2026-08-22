import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EnvelopesListSkeleton } from "@/features/envelopes/components/envelopes-list-skeleton";

export default function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="w-full sm:w-auto">
          <Skeleton className="mb-2 h-9 w-full max-w-48" />
          <Skeleton className="h-5 w-full max-w-64" />
        </div>
        <Skeleton className="h-10 w-full sm:w-40" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-32" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full sm:h-80" />
        </CardContent>
      </Card>

      {/* Envelopes Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-10 md:w-32" />
          </div>
        </div>
        <EnvelopesListSkeleton />
      </div>
    </div>
  );
}
