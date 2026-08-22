import { auth } from "@clerk/nextjs/server";
import { getBudgetByIdAction } from "@/features/budgets/actions/get-budget-by-id.action";
import { getExpensesAction } from "@/features/expenses/actions/get-expenses.action";
import { DeleteBudgetAlertDialog } from "@/features/budgets/components/DeleteBudgetAlertDialog";
import { UpdateBudgetDialog } from "@/features/budgets/components/UpdateBudgetDialog";
import { CreateExpenseDialog } from "@/features/expenses/components/CreateExpenseDialog";
import { ExpensesFilter } from "@/features/expenses/components/ExpensesFilter";
import { ExpensesList } from "@/features/expenses/components/ExpensesList";
import { BudgetActionsMenu } from "@/features/budgets/components/BudgetActionsMenu";
import { PageHeader } from "@/components/common/PageHeader";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/card";
import { formatCurrency } from "@/lib/format-currency";

import { CreditCard, DollarSign, PiggyBank, Wallet } from "lucide-react";
import nextDynamic from "next/dynamic";
import { BudgetChartSkeleton } from "@/features/budgets/components/BudgetChartSkeleton";

// recharts is a heavy dependency - code-split it into its own chunk,
// only needed once this section of the budget detail page renders.
// Aliased to `nextDynamic`: this file also exports the route segment
// config `dynamic = "force-dynamic"` below, which would otherwise
// collide with next/dynamic's default export name.
const BudgetChart = nextDynamic(
  () =>
    import("@/features/budgets/components/BudgetChart").then(
      (mod) => mod.BudgetChart,
    ),
  { loading: () => <BudgetChartSkeleton /> },
);

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

interface BudgetPageProps {
  params: Promise<{ budgetId: string }>;
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function BudgetPage({
  params,
  searchParams,
}: BudgetPageProps) {
  await auth.protect();
  const { budgetId } = await params;
  const { startDate, endDate, search, sort } = await searchParams;

  const [budget, expenses] = await Promise.all([
    getBudgetByIdAction(budgetId),
    getExpensesAction(budgetId, {
      startDate,
      endDate,
      search,
      sort,
    }),
  ]);

  const remaining = +budget.amount - +budget.spent;
  const percentage = (+budget.spent / +budget.amount) * 100;

  return (
    <div className="space-y-8 pb-24">
      {/* Header Section */}
      <PageHeader
        title={budget.name}
        backUrl="/dashboard/budgets"
        description={
          budget.category && (
            <p className="truncate text-sm text-muted-foreground">
              {budget.category}
            </p>
          )
        }
        actions={
          <>
            <UpdateBudgetDialog budget={budget} />
            <DeleteBudgetAlertDialog id={budgetId} name={budget.name} />
          </>
        }
        mobileActions={<BudgetActionsMenu budget={budget} />}
      />

      {/* Stats Grid - Top on all devices */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card
          className={
            remaining < 0
              ? "border-destructive/50 bg-destructive/5"
              : remaining < +budget.amount * 0.2
                ? "border-warning/50 bg-warning/5"
                : "border-0 shadow-sm transition-colors duration-300 hover:bg-card"
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Disponible
            </CardTitle>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                remaining < 0
                  ? "bg-destructive/10 text-destructive"
                  : "bg-success/10 text-success"
              }`}
            >
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                remaining < 0 ? "text-destructive" : "text-success"
              }`}
            >
              {formatCurrency(remaining)}
            </div>
            {remaining < 0 && (
              <p className="mt-1 text-xs text-destructive">
                Presupuesto excedido
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm transition-colors duration-300 hover:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gastado
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(+budget.spent)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {percentage.toFixed(1)}% del presupuesto
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm transition-colors duration-300 hover:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Presupuesto Total
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
              <PiggyBank className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(+budget.amount)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {budget.expenses.length} transacciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Expenses List (Larger) */}
        <div className="space-y-6 lg:col-span-2">
          <div className="flex flex-row items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <DollarSign className="h-5 w-5 text-primary" />
              Historial de Gastos
            </h2>
            <CreateExpenseDialog budgetId={budget.id} />
          </div>

          <ExpensesFilter />
          <ExpensesList expenses={expenses} />
        </div>

        {/* Right Column: Chart */}
        <div className="space-y-6">
          <div className="h-[300px] w-full">
            <BudgetChart spent={+budget.spent} total={+budget.amount} />
          </div>
        </div>
      </div>
    </div>
  );
}
