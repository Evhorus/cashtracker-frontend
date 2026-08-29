import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getDashboardSummary } from "@/features/dashboard/data/get-dashboard-summary";
import { getEnvelopes } from "@/features/envelopes/data/get-envelopes";
import { YearFilterSelect } from "@/features/dashboard/components/year-filter-select";
import { CurrencyFilterSelect } from "@/features/dashboard/components/currency-filter-select";
import nextDynamic from "next/dynamic";
import { MonthlySpendingChartSkeleton } from "@/components/common/monthly-spending-chart-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heading } from "@/components/common/typography";
import { CategoryBreakdown } from "@/features/categories/components/category-breakdown";
import { CurrencyBreakdown } from "@/features/dashboard/components/currency-breakdown";
import { cn } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/format-currency";
import type { DashboardSummary } from "@/features/dashboard/schemas/dashboard.schema";

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

export const metadata: Metadata = { title: "Estadísticas" };

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

  // Only the summary is on the critical path. It's a precomputed
  // backend aggregate and it's what the header's filters and the chart
  // are built from, so the page can render everything above the fold
  // without waiting on the much heavier full-envelope fetch that only
  // the breakdowns below need - that one streams in behind its own
  // Suspense boundary.
  const summary = await getDashboardSummary(year, currencyParam);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Heading as="h1" size="lg">
            Estadísticas
          </Heading>
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

      {/* Keyed on the active filters so changing year/currency re-shows
          the fallback instead of silently swapping content once ready -
          the same visible "yes, that click registered" feedback the
          envelopes list uses, and the reason the filter controls above
          sit outside this boundary. */}
      <Suspense
        key={`${year ?? ""}-${chartCurrency}`}
        fallback={<BreakdownSkeleton multiCurrency={hasMultipleCurrencies} />}
      >
        <BreakdownSection
          totals={totals}
          chartCurrency={chartCurrency}
          hasMultipleCurrencies={hasMultipleCurrencies}
        />
      </Suspense>
    </div>
  );
}

interface BreakdownSectionProps {
  totals: (DashboardSummary["totals"][number] & { currency: CurrencyCode })[];
  chartCurrency: CurrencyCode;
  hasMultipleCurrencies: boolean;
}

/**
 * The two breakdown cards. Split out of the page body because these are
 * the only things needing the full envelope list, which is by far the
 * slowest fetch on this route - keeping it here means the header,
 * filters and chart no longer wait on it.
 */
async function BreakdownSection({
  totals,
  chartCurrency,
  hasMultipleCurrencies,
}: BreakdownSectionProps) {
  // Needs every envelope, not one paginated page of them - 100 is the
  // backend's hard cap on `limit` (a personal budget realistically has
  // dozens of envelopes, not hundreds, so this covers the real case;
  // past 100 the breakdown would silently miss some, the same tradeoff
  // the year filter already makes elsewhere).
  const envelopesResult = await getEnvelopes({ limit: 100 });

  // Same currency the chart itself is scoped to, so the two widgets tell
  // one consistent story instead of mixing currencies in one sum.
  const envelopesInChartCurrency = envelopesResult.data.filter(
    (envelope) => envelope.currency === chartCurrency,
  );

  const envelopeCounts = envelopesResult.data.reduce<Record<string, number>>(
    (counts, envelope) => {
      counts[envelope.currency] = (counts[envelope.currency] ?? 0) + 1;
      return counts;
    },
    {},
  );

  return (
    <div
      className={
        hasMultipleCurrencies ? "grid grid-cols-1 gap-6 lg:grid-cols-3" : ""
      }
    >
      <Card
        className={cn(
          hasMultipleCurrencies && "lg:col-span-2",
          "border-0 bg-card/50 shadow-sm",
        )}
      >
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

      {hasMultipleCurrencies && (
        <Card className="border-0 bg-card/50 shadow-sm">
          <CardHeader>
            <CardTitle>Por moneda</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyBreakdown
              totals={totals}
              envelopeCounts={envelopeCounts}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BreakdownSkeleton({ multiCurrency }: { multiCurrency: boolean }) {
  return (
    <div
      className={multiCurrency ? "grid grid-cols-1 gap-6 lg:grid-cols-3" : ""}
    >
      <Skeleton
        className={cn("h-72 rounded-xl", multiCurrency && "lg:col-span-2")}
      />
      {multiCurrency && <Skeleton className="h-72 rounded-xl" />}
    </div>
  );
}
