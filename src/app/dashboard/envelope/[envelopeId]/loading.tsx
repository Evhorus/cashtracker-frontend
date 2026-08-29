import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpensesListSkeleton } from "@/features/expenses/components/expenses-list-skeleton";
import { EnvelopeChartSkeleton } from "@/features/envelopes/components/envelope-chart-skeleton";

// Mirrors the real page's layout: Historial de Gastos (main, left on
// desktop) + a single "Resumen" panel (sidebar, sticky on desktop) -
// replaced the old 3-separate-stat-cards + isolated chart layout, which
// no longer matches since that page was consolidated into one panel.
export default function EnvelopeDetailLoading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton actions="back-edit-delete" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="order-2 space-y-6 lg:order-1 lg:col-span-2">
          <div className="flex flex-row items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-10 w-10 sm:w-36" />
          </div>

          {/* Matches ExpensesFilter */}
          <div className="flex flex-col gap-4 md:flex-row">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-52" />
          </div>

          <ExpensesListSkeleton />
        </div>

        <div className="order-1 lg:order-2">
          <Card className="border-0 bg-card/50 shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-5">
              <EnvelopeChartSkeleton />

              <div className="divide-y divide-border/60">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
