import { auth } from "@clerk/nextjs/server";
import { getDashboardSummaryAction } from "@/features/dashboard/actions/get-dashboard-summary.action";
import { getEnvelopesAction } from "@/features/envelopes/actions/get-envelopes.action";
import { YearFilterSelect } from "@/features/dashboard/components/year-filter-select";
import { CurrencyFilterSelect } from "@/features/dashboard/components/currency-filter-select";
import nextDynamic from "next/dynamic";
import { MonthlySpendingChartSkeleton } from "@/components/common/monthly-spending-chart-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBreakdown } from "@/features/categories/components/category-breakdown";
import type { CurrencyCode } from "@/lib/format-currency";

// recharts is a heavy dependency - code-split it into its own chunk, same
// reasoning as it had on dashboard/page.tsx before this moved here (see
// that file's history).
const MonthlySpendingChart = nextDynamic(
  () =>
    import("@/components/common/monthly-spending-chart").then(
      (mod) => mod.MonthlySpendingChart,
    ),
  { loading: () => <MonthlySpendingChartSkeleton /> },
);

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

interface StatisticsPageProps {
  searchParams: Promise<{ year?: string; currency?: string }>;
}

// The year/currency-filterable monthly trend, split out of "/dashboard"
// (now a lightweight Resumen) - this is where you dig into history, so
// the filters that only affect the chart live here with it instead of
// on the glanceable overview page.
export default async function StatisticsPage({
  searchParams,
}: StatisticsPageProps) {
  await auth.protect();
  const { year: yearParam, currency: currencyParam } = await searchParams;
  const year = yearParam ? parseInt(yearParam, 10) || undefined : undefined;

  const [summary, envelopesResult] = await Promise.all([
    getDashboardSummaryAction(year, currencyParam),
    // Category breakdown below needs every envelope, not one paginated
    // page of them - 100 is the backend's hard cap on `limit` (a personal
    // budget realistically has dozens of envelopes, not hundreds, so this
    // covers the real case; past 100 the breakdown would silently miss
    // some, same tradeoff the year filter already makes elsewhere).
    getEnvelopesAction({ limit: 100 }),
  ]);

  const chartData = summary.chart.map((entry) => ({
    label: entry.label,
    Gastado: entry.spent,
    Disponible: entry.available,
  }));

  const totals = summary.totals.map((total) => ({
    ...total,
    currency: total.currency as CurrencyCode,
  }));
  const hasMultipleCurrencies = totals.length > 1;
  const chartCurrency = (summary.chartCurrency ?? "COP") as CurrencyCode;

  // Same currency the chart itself is scoped to, so the two widgets tell
  // one consistent story instead of mixing currencies in one sum.
  const envelopesInChartCurrency = envelopesResult.data.filter(
    (envelope) => envelope.currency === chartCurrency,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Estadísticas</h1>
          <p className="mt-1 text-muted-foreground">
            Tendencias y desglose de tu gasto
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

      <MonthlySpendingChart
        chartData={chartData}
        totalEnvelopes={summary.totalEnvelopes}
        currency={chartCurrency}
        hasOtherCurrencies={hasMultipleCurrencies}
      />

      <Card className="border-0 bg-card/50 shadow-sm">
        <CardHeader>
          <CardTitle>Gasto por categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryBreakdown
            envelopes={envelopesInChartCurrency}
            currency={chartCurrency}
          />
        </CardContent>
      </Card>
    </div>
  );
}
