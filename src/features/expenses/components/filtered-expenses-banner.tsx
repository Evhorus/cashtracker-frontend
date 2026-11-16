import Link from "next/link";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { MethodOption } from "@/features/payment-methods/lib/method-filter";
import {
  CURRENCY_MAP,
  formatCurrency,
  type CurrencyCode,
} from "@/shared/utils/format-currency";

interface FilteredExpensesBannerProps {
  shown: number;
  total: number;
  totalAmount: number;
  currency: CurrencyCode;
  /** The selected payment methods, as offered by the filter. */
  methods: MethodOption[];
  search?: string;
  /** The same page without filters. */
  clearHref: string;
}

/**
 * Says, right above the list, what the list is showing: which payment
 * methods (by name and colour, so "only Davivienda" reads at a glance)
 * or search, how many of the envelope's expenses that leaves, and what
 * they add up to. This used to be a "Σ N gastos encontrados" row at the
 * bottom of the summary card - away from the list, behind a symbol not
 * everyone reads, and silent about which filter it was.
 */
export function FilteredExpensesBanner({
  shown,
  total,
  totalAmount,
  currency,
  methods,
  search,
  clearHref,
}: FilteredExpensesBannerProps) {
  const t = useTranslations("expenses.filteredBanner");
  const tMethods = useTranslations("paymentMethods.filter");

  return (
    <section
      aria-label={t("label")}
      className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3"
    >
      <div className="min-w-0 space-y-1.5">
        <p className="text-sm font-medium">{t("showing", { shown, total })}</p>
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          {methods.map((method) => (
            <span
              key={method.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5"
            >
              <span
                aria-hidden
                className={
                  method.color
                    ? "h-2 w-2 shrink-0 rounded-full"
                    : "h-2 w-2 shrink-0 rounded-full border border-dashed border-muted-foreground"
                }
                style={method.color ? { background: method.color } : undefined}
              />
              {method.name ?? tMethods("none")}
            </span>
          ))}
          {search && (
            <span className="rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5">
              {t("search", { term: search })}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{t("total")}</p>
          <p className="font-mono text-lg font-bold tabular-nums">
            {formatCurrency(totalAmount, CURRENCY_MAP[currency])}
          </p>
        </div>
        <Link
          href={clearHref}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
          {t("clear")}
        </Link>
      </div>
    </section>
  );
}
