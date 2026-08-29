import Link from "next/link";
import { Expense } from "@/features/expenses/types";
import { formatCalendarDate } from "@/lib/date-helpers";
import { CURRENCY_MAP, formatCurrency } from "@/lib/format-currency";
import type { CurrencyCode } from "@/lib/format-currency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardHoverActions } from "@/components/common/card-hover-actions";
import { UpdateExpenseDialog } from "./update-expense-dialog";
import { DeleteExpenseAlertDialog } from "./delete-expense-alert-dialog";

interface ExpensesTableProps {
  expenses: Expense[];
  envelopeId: string;
  currency: CurrencyCode;
}

// Desktop-only (see expenses-list.tsx - the card list still covers
// mobile). Same standard as EnvelopesTable/CategoriesTable: a dense
// table instead of the same cards stretched wider - this list didn't
// have one yet even though it's the exact same "many rows, scanned at
// once" shape those two already got a table for. Built on the shadcn
// Table primitives, styled to match those two (rounded-2xl border card,
// uppercase header, px-5 py-3.5 cells) rather than a one-off.
export function ExpensesTable({
  expenses,
  envelopeId,
  currency,
}: ExpensesTableProps) {
  const currencyConfig = CURRENCY_MAP[currency];

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-border/60 bg-card/30 md:block">
      <Table className="min-w-max text-sm">
        <TableHeader>
          <TableRow className="border-border/60 bg-card/60 text-xs font-semibold tracking-wider text-muted-foreground uppercase hover:bg-card/60">
            <TableHead className="h-auto px-5 py-3 text-left font-semibold text-inherit">
              Gasto
            </TableHead>
            <TableHead className="h-auto px-5 py-3 text-left font-semibold text-inherit">
              Fecha
            </TableHead>
            <TableHead className="h-auto px-5 py-3 text-right font-semibold text-inherit">
              Monto
            </TableHead>
            <TableHead className="h-auto px-5 py-3" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id} className="group border-border/60">
              <TableCell className="px-5 py-3.5">
                {/* Name+avatar is the row's one link, same convention as
                    EnvelopesTable's first cell - date/amount stay plain,
                    selectable text instead of the whole row being a
                    click target (see expense-card.tsx's own reasoning). */}
                <Link
                  href={`/dashboard/envelope/${envelopeId}/expenses/${expense.id}`}
                  className="flex min-w-0 items-center gap-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <span className="font-mono text-sm font-semibold">
                      {expense.name.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <span className="truncate font-medium hover:text-primary">
                    {expense.name}
                  </span>
                </Link>
              </TableCell>
              <TableCell className="px-5 py-3.5 text-muted-foreground">
                {formatCalendarDate(expense.date)}
              </TableCell>
              <TableCell className="px-5 py-3.5 text-right font-mono font-semibold text-primary">
                {formatCurrency(+expense.amount, currencyConfig)}
              </TableCell>
              <TableCell className="px-5 py-3.5">
                <CardHoverActions className="justify-end" alwaysVisible>
                  <UpdateExpenseDialog
                    envelopeId={envelopeId}
                    currency={currency}
                    expense={expense}
                  />
                  <DeleteExpenseAlertDialog
                    envelopeId={envelopeId}
                    expenseId={expense.id}
                  />
                </CardHoverActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
