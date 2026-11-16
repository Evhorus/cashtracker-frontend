import Link from "next/link";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  CURRENCY_MAP,
  formatCurrency,
  type CurrencyCode,
} from "@/shared/utils/format-currency";

interface FilterChip {
  key: string;
  label: string;
  /** Null for "no payment method" (dashed dot), undefined for no dot. */
  color?: string | null;
  /** The same page with only this filter removed. */
  removeHref: string;
}

interface FilteredExpensesBannerProps {
  shown: number;
  total: number;
  totalAmount: number;
  currency: CurrencyCode;
  chips: FilterChip[];
  /** The same page without any filter. */
  clearHref: string;
}

/**
 * Says, right above the list, what the list is showing: which filters
 * (each removable on its own), how many of the envelope's expenses that
 * leaves, and what they add up to. Replaces a "Σ N gastos encontrados"
 * row at the foot of the summary card - away from the list, behind a
 * symbol not everyone reads, and silent about which filter it was.
 */
export function FilteredExpensesBanner({
  shown,
  total,
  totalAmount,
  currency,
  chips,
  clearHref,
}: FilteredExpensesBannerProps) {
  const t = useTranslations("expenses.filteredBanner");

  return (
    <section
      aria-label={t("label")}
      className="mb-4 rounded-2xl border border-primary/30 bg-primary/5 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{t("showing", { shown, total })}</p>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          nativeButton={false}
          render={<Link href={clearHref} />}
        >
          <X />
          {t("clear")}
        </Button>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <ul className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <li key={chip.key}>
              <Link
                href={chip.removeHref}
                aria-label={t("remove", { filter: chip.label })}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 py-1 pr-1.5 pl-2.5 text-sm transition-colors hover:border-destructive/50"
              >
                {chip.color !== undefined && (
                  <span
                    aria-hidden
                    className={
                      chip.color
                        ? "h-2 w-2 shrink-0 rounded-full"
                        : "h-2 w-2 shrink-0 rounded-full border border-dashed border-muted-foreground"
                    }
                    style={chip.color ? { background: chip.color } : undefined}
                  />
                )}
                {chip.label}
                <X className="h-3.5 w-3.5 text-muted-foreground group-hover:text-destructive" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="sm:text-right">
          <p className="text-xs text-muted-foreground">{t("total")}</p>
          <p className="font-mono text-xl font-bold tabular-nums">
            {formatCurrency(totalAmount, CURRENCY_MAP[currency])}
          </p>
        </div>
      </div>
    </section>
  );
}
