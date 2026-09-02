import { useTranslations } from "next-intl";
import {
  CURRENCY_MAP,
  formatCurrency,
  type CurrencyCode,
} from "@/lib/format-currency";
import type { DashboardBreakdownTotal as DashboardBreakdownTotalRow } from "@/features/dashboard/schemas/dashboard.schema";

interface BreakdownTotalProps {
  total: DashboardBreakdownTotalRow;
  currency: CurrencyCode;
}

// The "Total" tab - a single number rather than a list of rows, since
// there's nothing left to group once every axis (category/envelope/
// name) has its own tab beside it.
export function BreakdownTotal({ total, currency }: BreakdownTotalProps) {
  const t = useTranslations("statistics");
  const config = CURRENCY_MAP[currency];

  return (
    <div className="flex flex-col items-center gap-1.5 py-10 text-center">
      <p className="font-mono text-3xl font-bold sm:text-4xl">
        {formatCurrency(total.spent, config)}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("expenseCount", { count: total.expenseCount })}
      </p>
    </div>
  );
}
