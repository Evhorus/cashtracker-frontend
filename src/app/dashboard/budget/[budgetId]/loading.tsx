import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

export default function BudgetLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" disabled>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución del Presupuesto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <Skeleton className="h-48 w-48 rounded-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Historial de Gastos</CardTitle>
              <Skeleton className="h-10 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Presupuesto Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Gastado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-32 mb-2" />
              <Skeleton className="h-4 w-28" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Disponible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Número de Gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-16" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
