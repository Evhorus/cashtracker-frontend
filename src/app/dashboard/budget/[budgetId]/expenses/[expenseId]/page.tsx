import { getBudgetByIdAction } from '@/budgets/actions/budgets/get-budget-by-id.action';
import { getExpenseByIdAction } from '@/budgets/actions/expenses/get-expense-by-id.action';
import { DeleteExpenseAlertDialog } from '@/budgets/components/expenses/DeleteExpenseAlertDialog';
import { UpdateExpenseDialog } from '@/budgets/components/expenses/UpdateExpenseDialog';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

import { formatCurrency } from '@/shared/lib/format-currency';
import { formatDate } from '@/shared/lib/format-date';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

interface ExpensePageProps {
  params: Promise<{ budgetId: string; expenseId: string }>;
}

export default async function ExpensePage({ params }: ExpensePageProps) {
  const { budgetId, expenseId } = await params;

  const expense = await getExpenseByIdAction(budgetId, expenseId);

  const budget = await getBudgetByIdAction(budgetId);

  const impactPercentage = (+expense.amount / +budget.amount) * 100;

  const budgeTotalAmount = +budget.amount;
  const budgetSpent = +budget.spent;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/budget/${budgetId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div className="flex-1">
          <h1 className="text-3xl font-bold">{expense.name}</h1>
          <p className="text-muted-foreground mt-1">Gasto de {budget.name}</p>
        </div>
        <div className="flex gap-2">
          <UpdateExpenseDialog budgetId={budgetId} expense={expense} />

          <DeleteExpenseAlertDialog budgetId={budgetId} expenseId={expenseId} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Gasto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="font-semibold">{formatDate(expense.date)}</p>
              </div>
            </div>

            {/* {expense.category && (
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Categoría</p>
                  <p className="font-semibold">{expense.category}</p>
                </div>
              </div>
            )} */}

            {expense.description && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="text-sm mt-1">{expense.description}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impacto en el Presupuesto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Monto del gasto
              </p>
              <p className="text-3xl font-bold">
                {formatCurrency(+expense.amount)}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">
                Porcentaje del presupuesto
              </p>
              <p className="text-2xl font-bold text-primary">
                {impactPercentage.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                de {formatCurrency(+budget.amount)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Estado del presupuesto
              </p>
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    budgetSpent > budgeTotalAmount
                      ? 'bg-destructive'
                      : budgeTotalAmount - budgetSpent < budgeTotalAmount * 0.2
                      ? 'bg-destructive'
                      : 'bg-primary'
                  }`}
                />
                <span className="text-sm font-medium">
                  {budgetSpent > budgeTotalAmount
                    ? 'Presupuesto excedido'
                    : budgeTotalAmount - budgetSpent < budgeTotalAmount * 0.2
                    ? 'Presupuesto bajo'
                    : 'Presupuesto saludable'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha de creación:</span>
            <span className="font-medium">{formatDate(expense.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Fecha de actualización:
            </span>
            <span className="font-medium">{formatDate(expense.updatedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Presupuesto asociado:</span>

            <Link href={`/dashboard/budget/${budgetId}`}>
              <Button variant="link" className="h-auto p-0 font-medium">
                {budget.name}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
