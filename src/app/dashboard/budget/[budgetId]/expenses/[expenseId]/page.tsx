import { auth } from "@clerk/nextjs/server";
import { getBudgetByIdAction } from "@/features/budgets/actions/get-budget-by-id.action";
import { getExpenseByIdAction } from "@/features/expenses/actions/get-expense-by-id.action";
import { DeleteExpenseAlertDialog } from "@/features/expenses/components/DeleteExpenseAlertDialog";
import { UpdateExpenseDialog } from "@/features/expenses/components/UpdateExpenseDialog";
import { ExpenseActionsMenu } from "@/features/expenses/components/ExpenseActionsMenu";
import { PageHeader } from "@/components/common/PageHeader";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/card";

import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/date-helpers";
import { Calendar, FileText, Receipt } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

interface ExpensePageProps {
  params: Promise<{ budgetId: string; expenseId: string }>;
}

export default async function ExpensePage({ params }: ExpensePageProps) {
  await auth.protect();
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
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      {/* Header Section */}
      <PageHeader
        title="Detalle del Gasto"
        backUrl={`/dashboard/budget/${budgetId}`}
        description={
          <>
            <span className="text-sm">En presupuesto:</span>
            <Link
              href={`/dashboard/budget/${budgetId}`}
              className="text-sm font-medium text-primary hover:underline"
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info Column (2/3 width) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Expense Highlight Card */}
          <Card className="overflow-hidden border-0 bg-linear-to-br from-card to-secondary/10 shadow-md">
            <CardContent className="p-8">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                    <Receipt className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {expense.name}
                    </h2>
                    <div className="flex w-fit items-center gap-2 rounded-full bg-background/50 px-2.5 py-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium sm:text-sm">
                        {formatDate(expense.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pl-18 text-left sm:pl-0 md:text-right">
                  <p className="mb-0.5 text-xs font-medium text-muted-foreground sm:text-sm">
                    Monto Total
                  </p>
                  <p className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
                    {formatCurrency(expenseAmount)}
                  </p>
                </div>
              </div>

              {expense.description && (
                <div className="mt-8 border-t border-border/50 pt-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Descripción
                  </h3>
                  <p className="max-w-2xl text-base leading-relaxed text-foreground/80">
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
            <CardContent className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2">
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
          <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="pt-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                Impacto en Presupuesto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div>
                <div className="mb-2 flex items-end justify-between">
                  <span className="w-full text-sm font-medium text-muted-foreground">
                    Representa el
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {impactPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.min(impactPercentage, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-right text-xs text-muted-foreground">
                  del total asignado ({formatCurrency(budgetAmount)})
                </p>
              </div>

              <div className="space-y-3 border-t border-border/50 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Estado del Presupuesto
                  </span>
                  <span
                    className={`rounded-md border bg-muted/50 px-3 py-1 text-xs font-bold ${healthColor}`}
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
