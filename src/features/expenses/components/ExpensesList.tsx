"use client";
import { Expense } from "@/features/expenses/types";
import { useParams } from "next/navigation";
import { ExpenseCard } from "./ExpenseCard";
import type { CurrencyCode } from "@/lib/format-currency";

interface ExpensesGridProps {
  expenses: Expense[];
  currency: CurrencyCode;
}

export const ExpensesList = ({ expenses, currency }: ExpensesGridProps) => {
  const { envelopeId } = useParams<{ envelopeId: string }>();

  return (
    <>
      {expenses.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-lg">No hay gastos registrados</p>
          <p className="mt-1 text-sm">Comienza agregando tu primer gasto</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              envelopeId={envelopeId}
              currency={currency}
            />
          ))}
        </div>
      )}
    </>
  );
};
