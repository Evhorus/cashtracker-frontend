import { useTranslations } from "next-intl";
import {
  CURRENCY_MAP,
  formatCurrency,
  type CurrencyCode,
} from "@/lib/format-currency";
import { Text } from "@/components/common/typography";
import type { DashboardNameBreakdownRow } from "@/features/dashboard/schemas/dashboard.schema";

interface ExpenseNameBreakdownProps {
  rows: DashboardNameBreakdownRow[];
  currency: CurrencyCode;
}

// Same row+bar shape as CategoryBreakdown (categories/components/
// category-breakdown.tsx), grouped by the expense's own name instead -
// this is what turns 8 monthly "Arriendo" expenses into one row with
// their combined total, rather than one row per month.
export function ExpenseNameBreakdown({
  rows,
  currency,
}: ExpenseNameBreakdownProps) {
  const t = useTranslations("statistics");
  const config = CURRENCY_MAP[currency];
  const total = rows.reduce((sum, row) => sum + row.spent, 0);

  if (rows.length === 0) {
    return <Text className="py-6 text-center">{t("noSpendingYet")}</Text>;
  }

  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const percentage = total > 0 ? (row.spent / total) * 100 : 0;
        return (
          <div key={row.name}>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                {row.name}
                {row.expenseCount > 1 && (
                  <span className="rounded-sm bg-secondary px-1 py-0.5 text-xs font-normal text-secondary-foreground">
                    {t("expenseCount", { count: row.expenseCount })}
                  </span>
                )}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {formatCurrency(row.spent, config)} · {percentage.toFixed(0)}%
              </span>
            </div>
            <div
              aria-hidden="true"
              className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary/60"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
