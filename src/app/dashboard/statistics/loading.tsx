import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatisticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="w-full sm:w-auto">
          <Skeleton className="mb-2 h-9 w-full max-w-48" />
          <Skeleton className="h-5 w-full max-w-64" />
        </div>
        <Skeleton className="h-10 w-full sm:w-40" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gasto mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full sm:h-80" />
        </CardContent>
      </Card>
    </div>
  );
}
