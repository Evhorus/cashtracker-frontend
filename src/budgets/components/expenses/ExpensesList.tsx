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
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div
                className="flex-1 min-w-0"
                onClick={() =>
                  router.push(`${budgetId}/expenses/${expense.id}`)
                }
              >
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold truncate">{expense.name}</h4>
                  {/* {expense.category && (
                    <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-full">
                      {expense.category}
                    </span>
                  )} */}
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(expense.date)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">
                  {formatCurrency(+expense.amount)}
                </span>
                <DeleteExpenseAlertDialog
                  budgetId={budgetId}
                  expenseId={expense.id}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
