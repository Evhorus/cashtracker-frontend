"use client";
import { Expense } from "@/features/expenses/types";
import { useParams, useSearchParams } from "next/navigation";
import { Receipt, SearchX } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ExpenseCard } from "./expense-card";
import { ExpensesTable } from "./expenses-table";
import type { CurrencyCode } from "@/lib/format-currency";

interface ExpensesGridProps {
  expenses: Expense[];
  currency: CurrencyCode;
}

/**
 * Empty state for this list. Filter-aware, the same distinction
 * EnvelopesGrid already made and this list didn't: "no results for this
 * search" must not read as "you have no expenses at all".
 *
 * Reads the URL directly rather than taking props - this component is
 * already a Client Component sitting under the same search/date filters
 * the server used to build the list, so there's nothing to thread down.
 */
function ExpensesEmptyState() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const hasDateFilter =
    searchParams.has("startDate") || searchParams.has("endDate");

  if (search) {
    return (
      <EmptyState
        icon={SearchX}
        title={`Sin resultados para "${search}"`}
        description="Prueba con otro nombre."
      />
    );
  }

  if (hasDateFilter) {
    return (
      <EmptyState
        icon={SearchX}
        title="Sin gastos en este periodo"
        description="Prueba con otro rango de fechas."
      />
    );
  }

  return (
    <EmptyState
      variant="first-run"
      icon={Receipt}
      title="Aún no hay gastos"
      description="Registra el primero con «Agregar Gasto» y verás aquí en qué se va el dinero de este sobre."
    />
  );
}

export const ExpensesList = ({ expenses, currency }: ExpensesGridProps) => {
  const { envelopeId } = useParams<{ envelopeId: string }>();

  if (expenses.length === 0) {
    return <ExpensesEmptyState />;
  }

  return (
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
  );
};
