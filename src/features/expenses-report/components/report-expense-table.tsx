import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { formatCalendarDateShort } from "@/shared/utils/date-helpers";
import {
  CURRENCY_MAP,
  formatCurrency,
  type CurrencyCode,
} from "@/shared/utils/format-currency";
import type { ReportExpense } from "../types";

interface ReportExpenseTableProps {
  expenses: ReportExpense[];
  /** Off in the split view, where every row of a group shares one. */
  showPaymentMethod: boolean;
}

export function formatAmount(amount: string | number, currency: string) {
  const config = CURRENCY_MAP[currency as CurrencyCode];
  return formatCurrency(Number(amount), config);
}

function PaymentMethodLabel({
  expense,
  fallback,
}: {
  expense: ReportExpense;
  fallback: string;
}) {
  const method = expense.paymentMethod;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: method?.color ?? "var(--muted-foreground)" }}
      />
      <span className={method ? undefined : "text-muted-foreground"}>
        {method?.name ?? fallback}
      </span>
    </span>
  );
}

/**
 * One table that reflows: a row of cells from `md` up, a two-line card
 * on a phone. A single markup for both (rather than a table plus a card
 * list) because the report is also printed, and printing one copy of
 * each row is simpler than hiding a duplicate.
 */
export function ReportExpenseTable({
  expenses,
  showPaymentMethod,
}: ReportExpenseTableProps) {
  const t = useTranslations("expensesReport");
  const locale = useLocale();
  const fallback = t("filters.noPaymentMethod");

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/30 print:rounded-none print:border-0">
      <table className="w-full text-sm">
        <thead className="hidden border-b border-border/60 bg-card/60 text-xs font-semibold tracking-wider text-muted-foreground uppercase md:table-header-group print:table-header-group">
          <tr>
            <th className="px-5 py-3 text-left font-semibold">
              {t("table.date")}
            </th>
            <th className="px-5 py-3 text-left font-semibold">
              {t("table.expense")}
            </th>
            <th className="px-5 py-3 text-left font-semibold">
              {t("table.envelope")}
            </th>
            {showPaymentMethod && (
              <th className="px-5 py-3 text-left font-semibold">
                {t("table.paymentMethod")}
              </th>
            )}
            <th className="px-5 py-3 text-right font-semibold">
              {t("table.amount")}
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className="grid grid-cols-[1fr_auto] gap-x-3 border-b border-border/60 px-4 py-3 last:border-0 md:table-row md:px-0 md:py-0 print:table-row print:break-inside-avoid"
            >
              <td className="col-start-1 row-start-2 text-xs whitespace-nowrap text-muted-foreground md:px-5 md:py-3.5 md:text-sm md:text-foreground print:px-2 print:py-1.5">
                {formatCalendarDateShort(expense.date, locale, true)}
              </td>
              <td className="col-start-1 row-start-1 font-medium md:px-5 md:py-3.5 print:px-2 print:py-1.5">
                {expense.name}
                {expense.description && (
                  <span className="block text-xs font-normal text-muted-foreground">
                    {expense.description}
                  </span>
                )}
              </td>
              <td className="col-start-1 row-start-3 text-xs md:px-5 md:py-3.5 md:text-sm print:px-2 print:py-1.5">
                <Link
                  href={`/dashboard/envelope/${expense.envelope.id}`}
                  className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline md:text-foreground print:no-underline"
                >
                  {expense.envelope.name}
                </Link>
              </td>
              {showPaymentMethod && (
                <td className="col-start-1 row-start-4 text-xs whitespace-nowrap md:px-5 md:py-3.5 md:text-sm print:px-2 print:py-1.5">
                  <PaymentMethodLabel expense={expense} fallback={fallback} />
                </td>
              )}
              <td className="col-start-2 row-span-4 row-start-1 self-center text-right font-mono font-medium whitespace-nowrap tabular-nums md:px-5 md:py-3.5 print:px-2 print:py-1.5">
                {formatAmount(expense.amount, expense.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
