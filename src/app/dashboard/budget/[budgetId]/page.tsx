import { getBudgetByIdAction } from "@/budgets/actions/budgets/get-budget-by-id.action";
import { getExpensesAction } from "@/budgets/actions/expenses/get-expenses.action";
import { DeleteBudgetAlertDialog } from "@/budgets/components/budgets/DeleteBudgetAlertDialog";
import { UpdateBudgetDialog } from "@/budgets/components/budgets/UpdateBudgetDialog";
import { CreateExpenseDialog } from "@/budgets/components/expenses/CreateExpenseDialog";
import { ExpensesFilter } from "@/budgets/components/expenses/ExpensesFilter";
import { ExpensesList } from "@/budgets/components/expenses/ExpensesList";
import { BudgetActionsMenu } from "@/budgets/components/budgets/BudgetActionsMenu";
import { PageHeader } from "@/shared/components/PageHeader";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { formatCurrency } from "@/shared/lib/format-currency";

import { CreditCard, DollarSign, PiggyBank, Wallet } from "lucide-react";
import { BudgetChart } from "@/budgets/components/budgets/BudgetChart";

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
            <p className="text-sm text-muted-foreground truncate">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className={
            remaining < 0
              ? "border-destructive/50 bg-destructive/5"
              : remaining < +budget.amount * 0.2
              ? "border-warning/50 bg-warning/5"
              : "border-0 shadow-sm hover:bg-card transition-colors duration-300"
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Disponible
            </CardTitle>
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
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
              <p className="text-xs text-destructive mt-1">
                Presupuesto excedido
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:bg-card transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gastado
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(+budget.spent)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {percentage.toFixed(1)}% del presupuesto
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:bg-card transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Presupuesto Total
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <PiggyBank className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(+budget.amount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {budget.expenses.length} transacciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Expenses List (Larger) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-row items-center justify-between">
            <h2 className="font-bold text-xl flex items-center gap-2">
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
