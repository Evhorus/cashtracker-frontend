import { auth } from "@clerk/nextjs/server";
import { Wallet } from "lucide-react";
import { getDashboardSummaryAction } from "@/features/dashboard/actions/get-dashboard-summary.action";
import { HeroBalanceCard } from "@/components/common/hero-balance-card";
import type { CurrencyCode } from "@/lib/format-currency";

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

// Resumen (glanceable overview): the hero balance card(s) - one per
// currency in use - plus a quick envelope count. No year/currency
// filters and no chart - those live on /dashboard/statistics, since
// they're for digging into history rather than a quick "how am I doing".
// Always the default/current period - see get-dashboard-summary.action.ts.
export default async function DashboardPage() {
  await auth.protect();

  const summary = await getDashboardSummaryAction();

  const totals = summary.totals.map((total) => ({
    ...total,
    currency: total.currency as CurrencyCode,
  }));
  const hasMultipleCurrencies = totals.length > 1;

  // Real month-over-month change, not a placeholder: the last two months
  // of the summary's own chart, for whichever currency that chart is
  // scoped to (see dashboard.schema.ts's chartCurrency comment) - never
  // shown for the other currencies, since there's nothing real to compute
  // it from for them.
  const lastTwoMonths = summary.chart.slice(-2);
  const deltaPercent =
    lastTwoMonths.length === 2 && lastTwoMonths[0].available !== 0
      ? ((lastTwoMonths[1].available - lastTwoMonths[0].available) /
          Math.abs(lastTwoMonths[0].available)) *
        100
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resumen</h1>
        <p className="mt-1 text-muted-foreground">
          Cómo van tus finanzas hoy
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {totals.map((total) => (
          <HeroBalanceCard
            key={total.currency}
            currency={total.currency}
            totalAssigned={total.totalAssigned}
            totalSpent={total.totalSpent}
            totalAvailable={total.totalAvailable}
            showCurrencyLabel={hasMultipleCurrencies}
            deltaPercent={
              total.currency === summary.chartCurrency ? deltaPercent : null
            }
          />
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Wallet className="h-4 w-4" />
        </div>
        <span className="text-sm text-muted-foreground">Sobres activos</span>
        <span className="ml-auto font-mono text-lg font-semibold">
          {summary.totalEnvelopes}
        </span>
      </div>
    </div>
  );
}
