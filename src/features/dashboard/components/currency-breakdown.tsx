import {
  CURRENCY_MAP,
  formatCurrency,
  type CurrencyCode,
} from "@/lib/format-currency";

interface CurrencyTotal {
  currency: CurrencyCode;
  /** Straight from the summary's own `COUNT(*) ... GROUP BY currency`
   * (getSummaryAggregate in cashtracker-backend). This used to be counted
   * client-side from a fetched envelope list, which was both redundant
   * and capped at 100 - so an account past that showed a count lower than
   * the totals right beside it, which came from this same uncapped
   * aggregate. */
  totalEnvelopes: number;
  totalAssigned: number;
  /** Every envelope in this currency, capped or not - never used for the
   * headline figure below (see totalSpentCapped, same reasoning as
   * HeroBalanceCard). */
  totalSpent: number;
  /** Spend within capped envelopes only - what "de X presupuestados"
   * actually measures against, so this is the headline figure instead
   * of totalSpent. */
  totalSpentCapped: number;
}

interface CurrencyBreakdownProps {
  totals: CurrencyTotal[];
}

// Real per-currency totals and counts, every figure from the same
// backend aggregate so they can't disagree with each other. Only worth
// rendering when there's more than one currency in play - see
// statistics/page.tsx.
export function CurrencyBreakdown({ totals }: CurrencyBreakdownProps) {
  return (
    <div className="space-y-3">
      {totals.map((total) => {
        const config = CURRENCY_MAP[total.currency];
        const count = total.totalEnvelopes;
        // Same reasoning as HeroBalanceCard's unlimitedSpent - money
        // spent outside any budget, real but not part of "de X
        // presupuestados" below, so it's called out on its own line
        // instead of silently folded into the headline figure.
        const unlimitedSpent = total.totalSpent - total.totalSpentCapped;
        return (
          <div
            key={total.currency}
            className="rounded-xl border border-border/60 bg-background/40 p-3.5"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-xs font-semibold text-secondary-foreground">
                {total.currency}
              </span>
              <span className="text-xs text-muted-foreground">
                {count} {count === 1 ? "sobre" : "sobres"}
              </span>
            </div>
            <p className="mt-2.5 font-mono text-lg font-semibold">
              {formatCurrency(total.totalSpentCapped, config)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              de {formatCurrency(total.totalAssigned, config)} presupuestados
            </p>
            {unlimitedSpent > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                +{" "}
                <b className="font-mono font-semibold text-foreground">
                  {formatCurrency(unlimitedSpent, config)}
                </b>{" "}
                en sobres sin límite
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
