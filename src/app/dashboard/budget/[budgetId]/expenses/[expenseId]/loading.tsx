import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ArrowLeft, Calendar, FileText } from "lucide-react";

export default function ExpenseLoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="ghost" size="icon" disabled className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <Skeleton className="h-9 w-full max-w-64 mb-2" />
          <Skeleton className="h-5 w-full max-w-40" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Gasto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Fecha</p>
                <Skeleton className="h-6 w-32 mt-1" />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Descripción</p>
                <Skeleton className="h-16 w-full mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impacto en el Presupuesto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Monto del gasto
              </p>
              <Skeleton className="h-10 w-40" />
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">
                Porcentaje del presupuesto
              </p>
              <Skeleton className="h-8 w-24 mt-1" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Estado del presupuesto
              </p>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha de creación:</span>
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Fecha de actualización:
            </span>
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Presupuesto asociado:</span>
            <Skeleton className="h-5 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
