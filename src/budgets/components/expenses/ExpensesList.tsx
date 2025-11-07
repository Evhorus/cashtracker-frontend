'use client';
import { Expense } from '@/budgets/types';

import { Button } from '@/shared/components/ui/button';
import { Calendar, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { DeleteExpenseAlertDialog } from './DeleteExpenseAlertDialog';
import { formatDate } from '@/shared/lib/format-date';
import { formatCurrency } from '@/shared/lib/format-currency';

interface ExpensesGridProps {
  expenses: Expense[];
}

export const ExpensesList = ({ expenses }: ExpensesGridProps) => {
  const { budgetId } = useParams<{ budgetId: string }>();

  const router = useRouter();

  return (
    <>
      {expenses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay gastos registrados
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="relative flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => router.push(`${budgetId}/expenses/${expense.id}`)}
            >
              {/* Contenido principal */}
              <div className="flex-1 min-w-0">
                {/* Título con line-clamp */}
                <h4 className="font-semibold text-base line-clamp-2 pr-8 sm:pr-0">
                  {expense.name}
                </h4>

                {/* Fecha y precio */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(expense.date)}
                  </span>
                  <span className="font-bold text-lg">
                    {formatCurrency(+expense.amount)}
                  </span>
                </div>
              </div>

              {/* Botón eliminar */}
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => e.stopPropagation()}
              >
                <DeleteExpenseAlertDialog
                  budgetId={budgetId}
                  expenseId={expense.id}
                />
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
