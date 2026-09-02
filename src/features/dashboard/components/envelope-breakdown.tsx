import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  CURRENCY_MAP,
  formatCurrency,
  type CurrencyCode,
} from "@/lib/format-currency";
import { Text } from "@/components/common/typography";
import type { DashboardEnvelopeBreakdownRow } from "@/features/dashboard/schemas/dashboard.schema";

interface EnvelopeBreakdownProps {
  rows: DashboardEnvelopeBreakdownRow[];
  currency: CurrencyCode;
}

// Same row+bar shape as CategoryBreakdown (categories/components/
// category-breakdown.tsx), grouped by envelope instead - its own
// component rather than a shared abstraction over both, since this one
// links each row to its envelope and has no icon/colour to resolve.
export function EnvelopeBreakdown({ rows, currency }: EnvelopeBreakdownProps) {
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
          <div key={row.envelopeId}>
            <div className="flex items-center justify-between text-sm">
              <Link
                href={`/dashboard/envelope/${row.envelopeId}`}
                className="font-medium hover:underline"
              >
                {row.envelopeName}
              </Link>
              <span className="flex items-baseline gap-1.5 font-mono">
                <span className="text-sm font-semibold">
                  {formatCurrency(row.spent, config)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {percentage.toFixed(0)}%
                </span>
              </span>
            </div>
            {/* Decorative - the percentage is already in the row's own
                text above (see envelopes-table.tsx for the same call). */}
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
