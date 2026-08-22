import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const EnvelopesSummaryChartSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de Sobres</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-80 w-full" />
      </CardContent>
    </Card>
  );
};
