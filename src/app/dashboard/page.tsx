import { getBudgetsAction } from "@/budgets/actions/budgets/get-budgets.action";
import { BudgetsGrid } from "@/budgets/components/budgets/BudgetsGrid";
import { CreateBudgetDialog } from "@/budgets/components/budgets/CreateBudgetDialog";
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
        <CreateBudgetDialog />
      </div>

      <StatsCards
        totalBudget={totalBudget}
        totalCount={budgets.count}
        totalSpent={totalSpent}
        totalRemaining={totalRemaining}
      />

      <Chart chartData={chartData} totalBudgets={budgets.count} />

      <BudgetsGrid budgets={budgets.data} />
    </div>
  );
}
