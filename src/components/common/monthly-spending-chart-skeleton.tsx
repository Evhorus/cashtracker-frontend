import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const MonthlySpendingChartSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Mes</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-80 w-full" />
      </CardContent>
    </Card>
  );
};
