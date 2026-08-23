import { Wallet, DollarSign, TrendingUp, PieChart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  CURRENCY_MAP,
  DEFAULT_CURRENCY_CONFIG,
  formatCurrency,
  type CurrencyCode,
} from "@/lib/format-currency";

export interface CurrencyTotals {
  currency: CurrencyCode;
  totalAssigned: number;
  totalSpent: number;
  totalAvailable: number;
}

interface StatsCardsProps {
  totalEnvelopes: number;
  /** One entry per currency in use - money in different currencies is
   * never one unit, so this can't be flattened into single totals the
   * way `totalEnvelopes` (a plain count) can. */
  totals: CurrencyTotals[];
}

// Asignado/Gastado/Disponible for one currency - pulled out so the
// common case (one currency, rendered inline with Sobres Activos below)
// and the rare multi-currency case (each stacked in its own labeled row)
// render identically instead of two near-duplicate JSX blocks.
function CurrencyStatCards({ totals }: { totals: CurrencyTotals }) {
  const config = CURRENCY_MAP[totals.currency] ?? DEFAULT_CURRENCY_CONFIG;

  return (
    <>
      <Card className="animate-fade-in border-0 bg-card/50 shadow-sm transition-colors duration-300 [animation-delay:100ms] hover:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Asignado
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
            <DollarSign className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totals.totalAssigned, config)}
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in border-0 bg-card/50 shadow-sm transition-colors duration-300 [animation-delay:200ms] hover:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Gastado
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totals.totalSpent, config)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {totals.totalAssigned > 0
              ? `${((totals.totalSpent / totals.totalAssigned) * 100).toFixed(1)}%`
              : "0%"}{" "}
            del total
          </p>
        </CardContent>
      </Card>

      <Card className="animate-fade-in border-0 bg-card/50 shadow-sm transition-colors duration-300 [animation-delay:300ms] hover:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Disponible
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10 text-success">
            <PieChart className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              totals.totalAvailable < 0 ? "text-destructive" : "text-success"
            }`}
          >
            {formatCurrency(totals.totalAvailable, config)}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

const ZERO_TOTALS: CurrencyTotals = {
  currency: "COP",
  totalAssigned: 0,
  totalSpent: 0,
  totalAvailable: 0,
};

function CurrencyLabel({ currency }: { currency: CurrencyCode }) {
  return (
    <p className="text-sm font-medium text-muted-foreground">
      {CURRENCY_MAP[currency]?.label ?? currency}
    </p>
  );
}

export const StatsCards = ({ totalEnvelopes, totals }: StatsCardsProps) => {
  // No envelopes yet - still show the money cards at $0 (COP, the app's
  // default) rather than dropping them, so a brand-new account doesn't
  // suddenly show a 1-card row.
  const resolvedTotals = totals.length > 0 ? totals : [ZERO_TOTALS];
  const hasMultipleCurrencies = resolvedTotals.length > 1;

  const sobresActivosCard = (
    <Card className="animate-fade-in border-0 bg-card/50 shadow-sm transition-colors duration-300 hover:bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Sobres Activos
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Wallet className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalEnvelopes}</div>
      </CardContent>
    </Card>
  );

  // Single currency (the overwhelming common case): unchanged from
  // before the per-currency split - one row, Sobres Activos plus that
  // currency's three cards, no label needed since there's nothing to
  // disambiguate.
  if (!hasMultipleCurrencies) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {sobresActivosCard}
        <CurrencyStatCards totals={resolvedTotals[0]} />
      </div>
    );
  }

  // Multiple currencies: every currency gets its own labeled row,
  // including what would otherwise be the unlabeled "primary" one -
  // once there's more than one, leaving any of them unlabeled is
  // exactly the ambiguity this is supposed to resolve. Sobres Activos
  // stands on its own above them since it isn't tied to a currency.
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sobresActivosCard}
      </div>

      {resolvedTotals.map((currencyTotals) => (
        <div key={currencyTotals.currency} className="space-y-2">
          <CurrencyLabel currency={currencyTotals.currency} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <CurrencyStatCards totals={currencyTotals} />
          </div>
        </div>
      ))}
    </div>
  );
};
