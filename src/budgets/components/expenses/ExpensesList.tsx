'use client';
import { Expense } from '@/budgets/types';

import { Button } from '@/shared/components/ui/button';
import { Calendar, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { DeleteExpenseAlertDialog } from './DeleteExpenseAlertDialog';
import { formatDate } from '@/shared/lib/format-date';
import { formatCurrency } from '@/shared/lib/format-currency';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';

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
        <div className="space-y-4">
          {expenses.map((expense) => (
            <Card
              key={expense.id}
              className="flex flex-col gap-2 cursor-pointer transition-colors hover:bg-muted"
              onClick={() => router.push(`${budgetId}/expenses/${expense.id}`)}
            >
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-bold">{expense.name}</h4>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(expense.date)}
                  </span>
                </div>

                <div className="flex flex-row items-center justify-between">
                  <span className="font-bold text-lg">
                    {formatCurrency(+expense.amount)}
                  </span>

                  <div
                    onClick={(e) => e.stopPropagation()} // Evita que se propague el click y navegue
                  >
                    <DeleteExpenseAlertDialog
                      budgetId={budgetId}
                      expenseId={expense.id}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};
