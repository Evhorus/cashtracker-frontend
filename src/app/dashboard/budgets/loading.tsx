import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { BudgetsListSkeleton } from "@/budgets/components/budgets/BudgetsListSkeleton";

export default function BudgetsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="pointer-events-none">
            <Button variant="ghost" size="icon" disabled>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Mis Presupuestos</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona todos tus presupuestos
            </p>
          </div>
        </div>

        {/* Create Budget Button Skeleton */}
        <Skeleton className="h-10 w-40" />
      </div>

      <BudgetsListSkeleton />
    </div>
  );
}
