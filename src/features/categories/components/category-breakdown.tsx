import { Tag } from "lucide-react";
import { CURRENCY_MAP, formatCurrency, type CurrencyCode } from "@/lib/format-currency";
import { resolveCategory, type CategoryDef } from "../lib/category-palette";
import { getCategoriesCached } from "../lib/get-categories-cached";
import { Text } from "@/components/common/typography";

interface CategoryBreakdownProps {
  /** Only needs the two fields it actually groups/sums by - callers pass
   * Envelope[] as-is. */
  envelopes: { category?: string | null; spent: string }[];
  currency: CurrencyCode;
}

const NO_CATEGORY: Pick<CategoryDef, "label" | "color" | "Icon"> = {
  label: "Sin categoría",
  color: "oklch(0.5 0.02 260)",
  Icon: Tag,
};

// Real aggregation, computed here rather than on the backend: group every
// envelope with spend > 0 (in the given currency) by its category, sum
// `spent` per group. Nothing here is estimated or sampled - it's exactly
// what's on screen elsewhere (envelope cards/table), just reduced.
//
// Async Server Component: fetches the user's categories itself
// (getCategoriesCached() dedupes per request), same reasoning as
// CategoryIcon/CategoryLabel in category-badge.tsx.
export async function CategoryBreakdown({ envelopes, currency }: CategoryBreakdownProps) {
  const categories = await getCategoriesCached();
  const config = CURRENCY_MAP[currency];

  const buckets = new Map<
    string,
    { label: string; color: string; Icon: CategoryDef["Icon"]; amount: number }
  >();

  for (const envelope of envelopes) {
    const spent = Number(envelope.spent);
    if (!spent || spent <= 0) continue;

    const def = resolveCategory(envelope.category, categories);
    const key = def ? def.label.toLowerCase() : "__none__";
    const existing = buckets.get(key);
    if (existing) {
      existing.amount += spent;
    } else {
      const { label, color, Icon } = def ?? NO_CATEGORY;
      buckets.set(key, { label, color, Icon, amount: spent });
    }
  }

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
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary/60">
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
