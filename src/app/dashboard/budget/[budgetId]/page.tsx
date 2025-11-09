import Link from 'next/link';
import { getBudgetByIdAction } from '@/budgets/actions/budgets/get-budget-by-id.action';
import { DeleteBudgetAlertDialog } from '@/budgets/components/budgets/DeleteBudgetAlertDialog';
import { UpdateBudgetDialog } from '@/budgets/components/budgets/UpdateBudgetDialog';
import { CreateExpenseDialog } from '@/budgets/components/expenses/CreateExpenseDialog';
import { ExpensesList } from '@/budgets/components/expenses/ExpensesList';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/format-currency';

import { ArrowLeft } from 'lucide-react';
import { BudgetChart } from '@/budgets/components/budgets/BudgetChart';

interface BudgetPageProps {
  params: Promise<{ budgetId: string }>;
}

export default async function BudgetPage({ params }: BudgetPageProps) {
  const { budgetId } = await params;

  const budget = await getBudgetByIdAction(budgetId);

  const remaining = +budget.amount - +budget.spent;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div className="flex-1">
          <h1 className="text-3xl font-bold">{budget.name}</h1>
          {budget.category && (
            <p className="text-muted-foreground mt-1">{budget.category}</p>
          )}
        </div>
        <div className="flex gap-2">
          <UpdateBudgetDialog budget={budget} />
          <DeleteBudgetAlertDialog id={budgetId} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución del Presupuesto</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetChart spent={+budget.spent} total={+budget.amount} />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <div className="flex flex-row items-center justify-between">
              <h2 className="font-bold text-2xl">Historial de Gastos</h2>
              <CreateExpenseDialog budgetId={budget.id} />
            </div>
            <div>
              <ExpensesList expenses={budget.expenses} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Presupuesto Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(+budget.amount)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Gastado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(+budget.spent)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {((+budget.spent / +budget.amount) * 100).toFixed(1)}% del
                presupuesto
              </p>
            </CardContent>
          </Card>

          <Card
            className={
              remaining < 0
                ? 'border-destructive'
                : remaining < +budget.amount * 0.2
                ? 'border-warning'
                : 'border-success'
            }
          >
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Disponible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${
                  remaining < 0 ? 'text-destructive' : 'text-success'
                }`}
              >
                {formatCurrency(remaining)}
              </div>
              {remaining < 0 && (
                <p className="text-sm text-destructive mt-1">
                  Presupuesto excedido
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Número de Gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{budget.expenses.length}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
