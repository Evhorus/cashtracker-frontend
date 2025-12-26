import Link from "next/link";
import { getBudgetsAction } from "@/budgets/actions/budgets/get-budgets.action";
import { BudgetsGrid } from "@/budgets/components/budgets/BudgetsGrid";
import { Button } from "@/shared/components/ui/button";
import { Chart } from "@/shared/components/Chart";
import { StatsCards } from "@/shared/components/StatsCards";
import { DashboardHelpers } from "@/budgets/lib/budget-helpers";

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const budgets = await getBudgetsAction();

  const totalBudget = DashboardHelpers.getTotalBudget(budgets.data);
  const totalSpent = DashboardHelpers.getTotalSpent(budgets.data);
  const totalRemaining = DashboardHelpers.getTotalRemaining(budgets.data);
  const chartData = DashboardHelpers.getChartData(budgets.data);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Resumen general de tus finanzas
          </p>
        </div>
      </div>

      <StatsCards
        totalBudget={totalBudget}
        totalCount={budgets.count}
        totalSpent={totalSpent}
        totalRemaining={totalRemaining}
      />

      <Chart chartData={chartData} totalBudgets={budgets.count} />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mis Presupuestos</h2>
        <Link href="/dashboard/budgets">
          <Button variant="link">Ver todos</Button>
        </Link>
      </div>

      <BudgetsGrid budgets={budgets.data.slice(0, 6)} />
    </div>
  );
}
