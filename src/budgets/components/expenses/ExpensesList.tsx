"use client";
import { Expense } from "@/budgets/types";
import { useParams } from "next/navigation";
import { ExpenseCard } from "./ExpenseCard";

interface ExpensesGridProps {
  expenses: Expense[];
}

export const ExpensesList = ({ expenses }: ExpensesGridProps) => {
  const { budgetId } = useParams<{ budgetId: string }>();

  return (
    <>
      {expenses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No hay gastos registrados</p>
          <p className="text-sm mt-1">Comienza agregando tu primer gasto</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              budgetId={budgetId}
            />
          ))}
        </div>
      )}
    </>
  );
};
