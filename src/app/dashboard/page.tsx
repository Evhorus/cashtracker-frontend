import { auth } from "@clerk/nextjs/server";
import { getDashboardSummaryAction } from "@/features/dashboard/actions/get-dashboard-summary.action";
import { YearFilterSelect } from "@/features/dashboard/components/year-filter-select";
import { CurrencyFilterSelect } from "@/features/dashboard/components/currency-filter-select";
import nextDynamic from "next/dynamic";
import { MonthlySpendingChartSkeleton } from "@/components/common/monthly-spending-chart-skeleton";
import { StatsCards } from "@/components/common/stats-cards";
import type { CurrencyCode } from "@/lib/format-currency";

// recharts is a heavy dependency - code-split it into its own chunk,
// only needed once this section of the dashboard renders.
// Aliased to `nextDynamic`: this file also exports the route segment
// config `dynamic = "force-dynamic"` below, which would otherwise
// collide with next/dynamic's default export name.
const MonthlySpendingChart = nextDynamic(
  () =>
    import("@/components/common/monthly-spending-chart").then(
      (mod) => mod.MonthlySpendingChart,
    ),
  { loading: () => <MonthlySpendingChartSkeleton /> },
);

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams: Promise<{ year?: string; currency?: string }>;
}

// Pure "how am I doing" summary - counts, per-currency totals, the
// monthly trend chart. Deliberately doesn't also preview envelope cards
// here anymore: that was the same EnvelopesGrid the dedicated
// /dashboard/envelopes page already renders in full, just truncated to
// 6 and duplicated on this page too - the existing "Sobres" link in
// custom-header.tsx's nav is the way there, not a second copy stacked
// under a multi-currency account's already-long stat card section. Ties
// back to a design pass on this page: too much content in one place,
// especially once StatsCards repeats per currency.
export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  await auth.protect();
  const { year: yearParam, currency: currencyParam } = await searchParams;
  const year = yearParam ? parseInt(yearParam, 10) || undefined : undefined;

  const summary = await getDashboardSummaryAction(year, currencyParam);

  const chartData = summary.chart.map((entry) => ({
    label: entry.label,
    Gastado: entry.spent,
    Disponible: entry.available,
  }));

  // The API schema types currency as a loose string (z.string()); the
  // domain side narrows it to the known currency codes, since it's the
  // app's own form that ever writes this value - same convention as
  // EnvelopeMapper.fromApi.
  const totals = summary.totals.map((total) => ({
    ...total,
    currency: total.currency as CurrencyCode,
  }));
  const hasMultipleCurrencies = totals.length > 1;
  // chartCurrency is whichever currency the backend actually scoped the
  // chart to (the requested one, if the user has envelopes in it -
  // otherwise its own fallback - see dashboard.service.ts on the
  // backend) - not necessarily totals[0], now that CurrencyFilterSelect
  // lets the user ask for a different one.
  const chartCurrency = (summary.chartCurrency ?? "COP") as CurrencyCode;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Resumen general de tus finanzas
          </p>
        </div>

        {(summary.availableYears.length > 0 || hasMultipleCurrencies) && (
          <div className="flex items-center gap-2">
            {summary.availableYears.length > 0 && (
              <YearFilterSelect
                years={summary.availableYears}
                selectedYear={year}
              />
            )}
            {hasMultipleCurrencies && (
              <CurrencyFilterSelect
                currencies={totals.map((total) => total.currency)}
                selectedCurrency={chartCurrency}
              />
            )}
          </div>
        )}
      </div>

      <StatsCards totalEnvelopes={summary.totalEnvelopes} totals={totals} />

      <MonthlySpendingChart
        chartData={chartData}
        totalEnvelopes={summary.totalEnvelopes}
        currency={chartCurrency}
        hasOtherCurrencies={hasMultipleCurrencies}
      />
    </div>
  );
}
