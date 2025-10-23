import { getBudgetsAction } from '@/budgets/actions/budgets/get-budgets.action';
import { BudgetsGrid } from '@/budgets/components/budgets/BudgetsGrid';
import { CreateBudgetDialog } from '@/budgets/components/budgets/CreateBudgetDialog';
import { Chart } from '@/shared/components/Chart';
import { StatsCards } from '@/shared/components/StatsCards';

export default async function DashboardPage() {
  const budgets = await getBudgetsAction();

  const totalBudget = budgets.data.reduce((sum, b) => sum + +b.amount, 0);
  const totalSpent = budgets.data.reduce((sum, b) => sum + +b.spent, 0);

  const totalRemaining = totalBudget - totalSpent;

  const chartData = budgets.data.slice(0, 5).map((b) => ({
    name: b.name.length > 15 ? b.name.substring(0, 15) + '...' : b.name,
    Gastado: +b.spent,
    Total: +b.amount,
  }));

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
