"use client";
import { Expense } from "@/budgets/types";

import { Calendar } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { DeleteExpenseAlertDialog } from "./DeleteExpenseAlertDialog";
import { formatDate } from "@/shared/lib/format-date";
import { formatCurrency } from "@/shared/lib/format-currency";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useCallback } from "react";

interface ExpensesGridProps {
  expenses: Expense[];
}

export const ExpensesList = ({ expenses }: ExpensesGridProps) => {
  const { budgetId } = useParams<{ budgetId: string }>();

  const router = useRouter();

  const handleExpenseClick = useCallback(
    (expenseId: string, e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      // Evitar navegación si el click viene del Drawer Overlay (Portal fuera de la tarjeta)
      if (!e.currentTarget.contains(target)) return;
      // Evitar navegación si el click es en el botón de borrar (marcado con data-no-nav)
      if (target.closest("[data-no-nav]")) return;

      router.push(`${budgetId}/expenses/${expenseId}`);
    },
    [budgetId, router]
  );

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
              onClick={(e) => handleExpenseClick(expense.id, e)}
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

                  <div data-no-nav>
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
