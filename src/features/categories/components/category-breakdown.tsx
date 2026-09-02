import { useTranslations } from "next-intl";
import { Tag } from "lucide-react";
import {
  CURRENCY_MAP,
  formatCurrency,
  type CurrencyCode,
} from "@/lib/format-currency";
import { resolveIcon } from "../lib/icon-registry";
import { Text } from "@/components/common/typography";
import type { DashboardCategoryBreakdownRow } from "@/features/dashboard/schemas/dashboard.schema";

interface CategoryBreakdownProps {
  /** Already summed per category by the backend - see
   * GET /dashboard/category-breakdown. */
  rows: DashboardCategoryBreakdownRow[];
  currency: CurrencyCode;
}

const NO_CATEGORY_COLOR = "oklch(0.5 0.02 260)";

/**
 * The spending-by-category breakdown. Every number here comes from the backend's own
 * GROUP BY, and so does every label and colour.
 *
 * This component used to do two things it no longer needs to: reduce over
 * a fetched envelope list (capped at 100, so it silently dropped
 * categories for a large account), and then re-merge rows whose free-text
 * labels resolved to the same category. Envelopes reference categories by
 * id now, so one category is one row by construction.
 */
export function CategoryBreakdown({ rows, currency }: CategoryBreakdownProps) {
  const t = useTranslations("categories");
  const tStats = useTranslations("statistics");
  const config = CURRENCY_MAP[currency];
  const total = rows.reduce((sum, row) => sum + row.spent, 0);

  if (rows.length === 0) {
    return <Text className="py-6 text-center">{tStats("noSpendingYet")}</Text>;
  }

  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const percentage = total > 0 ? (row.spent / total) * 100 : 0;
        const label = row.category?.label ?? t("none");
        const color = row.category?.color ?? NO_CATEGORY_COLOR;
        // On an object - see category-badge.tsx.
        const def = {
          Icon: row.category ? resolveIcon(row.category.icon) : Tag,
        };

        return (
          <div key={row.category?.id ?? "__none__"}>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <def.Icon className="h-3.5 w-3.5" style={{ color }} />
                {label}
              </span>
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
                className="h-full rounded-full"
                style={{ width: `${percentage}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
