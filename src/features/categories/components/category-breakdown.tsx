import { Tag } from "lucide-react";
import {
  CURRENCY_MAP,
  formatCurrency,
  type CurrencyCode,
} from "@/lib/format-currency";
import { resolveCategory, type CategoryDef } from "../lib/category-palette";
import { getCategories } from "../data/get-categories";
import { Text } from "@/components/common/typography";
import type { DashboardCategoryBreakdownRow } from "@/features/dashboard/schemas/dashboard.schema";

interface CategoryBreakdownProps {
  /** Already summed per category by the backend - see
   * GET /dashboard/category-breakdown. */
  rows: DashboardCategoryBreakdownRow[];
  currency: CurrencyCode;
}

const NO_CATEGORY: Pick<CategoryDef, "label" | "color" | "Icon"> = {
  label: "Sin categoría",
  color: "oklch(0.5 0.02 260)",
  Icon: Tag,
};

/**
 * "Gasto por categoría" - the sums come from the backend's own GROUP BY
 * now, not from reducing over a fetched envelope list capped at 100,
 * which silently dropped categories once an account passed it.
 *
 * The merge below still happens here, and has to: `envelope.category` is
 * free text, so the database groups by the exact string and returns
 * "Hogar" and "hogar" as two rows. Resolving each row against the user's
 * categories and re-merging by the resolved category is what the old
 * client-side version did per envelope - this does the same thing over
 * far fewer rows, so the displayed grouping is unchanged.
 *
 * Async Server Component: fetches the user's categories itself
 * (getCategories() dedupes per request), same reasoning as
 * CategoryIcon/CategoryLabel in category-badge.tsx.
 */
export async function CategoryBreakdown({
  rows: apiRows,
  currency,
}: CategoryBreakdownProps) {
  const categories = await getCategories();
  const config = CURRENCY_MAP[currency];

  const buckets = new Map<
    string,
    { label: string; color: string; Icon: CategoryDef["Icon"]; amount: number }
  >();

  for (const row of apiRows) {
    const def = resolveCategory(row.category, categories);
    const key = def ? def.label.toLowerCase() : "__none__";
    const existing = buckets.get(key);
    if (existing) {
      existing.amount += row.spent;
    } else {
      const { label, color, Icon } = def ?? NO_CATEGORY;
      buckets.set(key, { label, color, Icon, amount: row.spent });
    }
  }

  // Re-sorted after merging - the API orders by its own raw-text groups,
  // which can change order once two of them collapse into one.
  const rows = [...buckets.values()].sort((a, b) => b.amount - a.amount);
  const total = rows.reduce((sum, row) => sum + row.amount, 0);

  if (rows.length === 0) {
    return (
      <Text className="py-6 text-center">
        Aún no hay gastos este período para desglosar por categoría.
      </Text>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const percentage = total > 0 ? (row.amount / total) * 100 : 0;
        return (
          <div key={row.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <row.Icon
                  className="h-3.5 w-3.5"
                  style={{ color: row.color }}
                />
                {row.label}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {formatCurrency(row.amount, config)} · {percentage.toFixed(0)}%
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
                style={{ width: `${percentage}%`, background: row.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
