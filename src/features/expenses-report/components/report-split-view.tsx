import { useTranslations } from "next-intl";
import type { PaymentMethod } from "@/features/payment-methods/types";
import type { ExpensesReport } from "../types";
import { formatAmount, ReportExpenseTable } from "./report-expense-table";

interface ReportSplitViewProps {
  report: ExpensesReport;
  paymentMethods: PaymentMethod[];
}

interface Group {
  id: string | null;
  name: string;
  color?: string;
}

/**
 * One section per payment method, each with its own subtotal - so a
 * card's section can be held up against that card's statement. Groups
 * follow the order of the user's payment methods, then the expenses
 * without one; empty groups are left out.
 */
export function ReportSplitView({
  report,
  paymentMethods,
}: ReportSplitViewProps) {
  const t = useTranslations("expensesReport");

  const groups: Group[] = [
    ...paymentMethods.map((method) => ({
      id: method.id,
      name: method.name,
      color: method.color,
    })),
    { id: null, name: t("filters.noPaymentMethod") },
  ];

  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const expenses = report.expenses.filter(
          (expense) => (expense.paymentMethod?.id ?? null) === group.id,
        );
        if (expenses.length === 0) return null;
        const subtotals = report.totalsByPaymentMethod.filter(
          (total) => total.paymentMethodId === group.id,
        );

        return (
          <section
            key={group.id ?? "none"}
            className="space-y-3 print:break-inside-avoid-page"
          >
            <header className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    background: group.color ?? "var(--muted-foreground)",
                  }}
                />
                {group.name}
                <span className="text-sm font-normal text-muted-foreground">
                  · {t("summary.count", { count: expenses.length })}
                </span>
              </h2>
              <p className="flex gap-4 font-mono font-semibold tabular-nums">
                {subtotals.map((subtotal) => (
                  <span key={subtotal.currency}>
                    {formatAmount(subtotal.total, subtotal.currency)}
                  </span>
                ))}
              </p>
            </header>
            <ReportExpenseTable expenses={expenses} showPaymentMethod={false} />
          </section>
        );
      })}
    </div>
  );
}
