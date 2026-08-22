import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/card";

export const BudgetChartSkeleton = () => {
  return (
    <Card className="flex flex-col border-0 shadow-sm">
      <CardHeader className="items-center pb-0">
        <CardTitle>Distribución de Gastos</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex items-center justify-center">
        <Skeleton className="mx-auto aspect-square max-h-75 w-full rounded-full" />
      </CardContent>
    </Card>
  );
};
