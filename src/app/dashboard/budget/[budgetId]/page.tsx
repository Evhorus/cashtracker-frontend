import Link from "next/link";
import { getBudgetByIdAction } from "@/budgets/actions/budgets/get-budget-by-id.action";
import { DeleteBudgetAlertDialog } from "@/budgets/components/budgets/DeleteBudgetAlertDialog";
import { UpdateBudgetDialog } from "@/budgets/components/budgets/UpdateBudgetDialog";
import { CreateExpenseDialog } from "@/budgets/components/expenses/CreateExpenseDialog";
import { ExpensesList } from "@/budgets/components/expenses/ExpensesList";
import { BudgetActionsMenu } from "@/budgets/components/budgets/BudgetActionsMenu";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { formatCurrency } from "@/shared/lib/format-currency";

import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { BudgetChart } from "@/budgets/components/budgets/BudgetChart";

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

interface BudgetPageProps {
  params: Promise<{ budgetId: string }>;
}

export default async function BudgetPage({ params }: BudgetPageProps) {
  const { budgetId } = await params;

  const budget = await getBudgetByIdAction(budgetId);

  const remaining = +budget.amount - +budget.spent;
  const percentage = (+budget.spent / +budget.amount) * 100;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="-ml-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">
              {budget.name}
            </h1>
            {budget.category && (
              <p className="text-sm text-muted-foreground truncate">
                {budget.category}
              </p>
            )}
          </div>
        </div>

        {/* Mobile Actions (Drawer) */}
        <div className="md:hidden flex-shrink-0">
          <BudgetActionsMenu budget={budget} />
        </div>

        {/* Desktop Actions (Buttons) */}
        <div className="hidden md:flex gap-2 flex-shrink-0">
          <UpdateBudgetDialog budget={budget} />
          <DeleteBudgetAlertDialog id={budgetId} name={budget.name} />
        </div>
      </div>

      {/* Stats Grid - Top on all devices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className={
            remaining < 0
              ? "border-destructive/50 bg-destructive/5"
              : remaining < +budget.amount * 0.2
              ? "border-warning/50 bg-warning/5"
              : "border-success/50 bg-success/5"
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponible</CardTitle>
            <Wallet
              className={`h-4 w-4 ${
                remaining < 0 ? "text-destructive" : "text-success"
              }`}
            />
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Presupuesto Total
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
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
          <ExpensesList expenses={budget.expenses} />
        </div>

        {/* Right Column: Chart */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribución</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <BudgetChart spent={+budget.spent} total={+budget.amount} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
