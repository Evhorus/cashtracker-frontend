"use client";
import { Expense } from "@/features/expenses/types";
import { useParams } from "next/navigation";
import { ExpenseCard } from "./expense-card";
import { ExpensesTable } from "./expenses-table";
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
        <>
          {/* Mobile: the compact card list. Desktop: a dense table
              instead of the same cards stretched wider - see
              expenses-table.tsx, same split EnvelopesGrid already uses. */}
          <div className="space-y-2 md:hidden">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                envelopeId={envelopeId}
                currency={currency}
              />
            ))}
          </div>
          <ExpensesTable
            expenses={expenses}
            envelopeId={envelopeId}
            currency={currency}
          />
        </>
      )}
    </>
  );
};
