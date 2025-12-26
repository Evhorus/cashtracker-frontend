import { getBudgetByIdAction } from "@/budgets/actions/budgets/get-budget-by-id.action";
import { getExpenseByIdAction } from "@/budgets/actions/expenses/get-expense-by-id.action";
import { DeleteExpenseAlertDialog } from "@/budgets/components/expenses/DeleteExpenseAlertDialog";
import { UpdateExpenseDialog } from "@/budgets/components/expenses/UpdateExpenseDialog";
import { ExpenseActionsMenu } from "@/budgets/components/expenses/ExpenseActionsMenu";
import { PageHeader } from "@/shared/components/PageHeader";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import { formatCurrency } from "@/shared/lib/format-currency";
import { formatDate } from "@/shared/lib/format-date";
import { Calendar, FileText, Receipt } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

interface ExpensePageProps {
  params: Promise<{ budgetId: string; expenseId: string }>;
}

export default async function ExpensePage({ params }: ExpensePageProps) {
  const { budgetId, expenseId } = await params;
  const expense = await getExpenseByIdAction(budgetId, expenseId);
  const budget = await getBudgetByIdAction(budgetId);

  const budgetAmount = +budget.amount;
  const budgetSpent = +budget.spent;
  const expenseAmount = +expense.amount;
  const impactPercentage = (expenseAmount / budgetAmount) * 100;

  // Determine budget health color
  const isOverBudget = budgetSpent > budgetAmount;
  const isHealthy = budgetAmount - budgetSpent >= budgetAmount * 0.2;
  const healthColor = isOverBudget
    ? "text-destructive"
    : isHealthy
    ? "text-emerald-500"
    : "text-amber-500";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Header Section */}
      <PageHeader
        title="Detalle del Gasto"
        backUrl={`/dashboard/budget/${budgetId}`}
        description={
          <>
            <span className="text-sm">En presupuesto:</span>
            <Link
              href={`/dashboard/budget/${budgetId}`}
              className="hover:underline text-primary text-sm font-medium"
            >
              {budget.name}
            </Link>
          </>
        }
        actions={
          <>
            <UpdateExpenseDialog budgetId={budgetId} expense={expense} />
            <DeleteExpenseAlertDialog
              budgetId={budgetId}
              expenseId={expenseId}
            />
          </>
        }
        mobileActions={
          <ExpenseActionsMenu budgetId={budgetId} expense={expense} />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Expense Highlight Card */}
          <Card className="overflow-hidden border-0 shadow-md bg-linear-to-br from-card to-secondary/10">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                    <Receipt className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                      {expense.name}
                    </h2>
                    <div className="flex items-center gap-2 text-muted-foreground bg-background/50 px-2.5 py-1 rounded-full w-fit">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-xs sm:text-sm font-medium">
                        {formatDate(expense.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-left md:text-right pl-18 sm:pl-0">
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-0.5">
                    Monto Total
                  </p>
                  <p className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
                    {formatCurrency(expenseAmount)}
                  </p>
                </div>
              </div>

              {expense.description && (
                <div className="mt-8 pt-6 border-t border-border/50">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descripción
                  </h3>
                  <p className="text-base leading-relaxed text-foreground/80 max-w-2xl">
                    {expense.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Meta Info */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Información de Sistema</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Creado el</p>
                <p className="font-medium">{formatDate(expense.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Última actualización</p>
                <p className="font-medium">{formatDate(expense.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column (1/3 width) - Impact & Context */}
        <div className="space-y-6">
          {/* Impact Analysis */}
          <Card className="border-0 shadow-md overflow-hidden">
            <CardHeader className="pb-2 pt-6">
              <CardTitle className="text-lg flex items-center gap-2">
                Impacto en Presupuesto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm text-muted-foreground font-medium w-full">
                    Representa el
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {impactPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(impactPercentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  del total asignado ({formatCurrency(budgetAmount)})
                </p>
              </div>

              <div className="pt-4 border-t border-border/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Estado del Presupuesto
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-md bg-muted/50 border ${healthColor}`}
                  >
                    {isOverBudget
                      ? "EXCEDIDO"
                      : isHealthy
                      ? "SALUDABLE"
                      : "EN RIESGO"}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gastado Total</span>
                    <span className="font-semibold">
                      {formatCurrency(budgetSpent)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
