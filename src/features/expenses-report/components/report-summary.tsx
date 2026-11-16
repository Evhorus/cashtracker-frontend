import { useLocale, useTranslations } from "next-intl";
import type { PaymentMethod } from "@/features/payment-methods/types";
import {
  formatCalendarDateShort,
  formatMonthKeyLong,
  parseCalendarDate,
} from "@/shared/utils/date-helpers";
import type { ReportFilters } from "../lib/report-filters";
import type { ExpensesReport } from "../types";
import { formatAmount } from "./report-expense-table";

interface ReportSummaryProps {
  report: ExpensesReport;
  filters: ReportFilters;
  paymentMethods: PaymentMethod[];
}

/**
 * Which period is on screen, and the totals - one per currency, since
 * pesos and dollars never add up. In a statement-period report each
 * card's own dates are listed, because they differ per card.
 */
export function ReportSummary({
  report,
  filters,
  paymentMethods,
}: ReportSummaryProps) {
  const t = useTranslations("expensesReport");
  const locale = useLocale();

  const shortDate = (value: string) =>
    formatCalendarDateShort(parseCalendarDate(value), locale, true);
  const range = (start: string, end: string) =>
    t("summary.range", { start: shortDate(start), end: shortDate(end) });

  const periodLabel =
    filters.period === "custom" && filters.startDate && filters.endDate
      ? range(filters.startDate, filters.endDate)
      : `${t(`filters.periods.${filters.period}`)} · ${formatMonthKeyLong(filters.month, locale)}`;

  const cycleScopes =
    filters.period === "cycle"
      ? report.scopes.flatMap((scope) => {
          const method = paymentMethods.find(
            (candidate) => candidate.id === scope.paymentMethodId,
          );
          return method?.cutDay != null ? [{ method, scope }] : [];
        })
      : [];

  return (
    <section className="rounded-2xl border border-border/60 bg-card/30 p-5 print:border-0 print:p-0">
      <p className="text-sm font-medium first-letter:uppercase">
        {periodLabel}
      </p>

      {cycleScopes.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {cycleScopes.map(({ method, scope }) => (
            <li key={method.id} className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: method.color }}
              />
              {method.name}: {range(scope.startDate, scope.endDate)}
            </li>
          ))}
          <li className="text-xs">{t("summary.cycleNote")}</li>
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-3">
        {report.totalsByCurrency.map((total) => (
          <div key={total.currency}>
            <p className="text-xs tracking-wider text-muted-foreground uppercase">
              {t("summary.total")} · {total.currency}
            </p>
            <p className="font-mono text-2xl font-semibold tabular-nums">
              {formatAmount(total.total, total.currency)}
            </p>
          </div>
        ))}
        <p className="text-sm text-muted-foreground">
          {t("summary.count", { count: report.expenses.length })}
        </p>
      </div>
    </section>
  );
}
