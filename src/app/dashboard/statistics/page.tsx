import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getLocale, getTranslations } from "next-intl/server";
import { formatMonthKey } from "@/lib/date-helpers";
import { getDashboardSummary } from "@/features/dashboard/data/get-dashboard-summary";
import { getCategoryBreakdown } from "@/features/dashboard/data/get-category-breakdown";
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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("statistics");
  return { title: t("title") };
}

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
  const locale = await getLocale();
  const t = await getTranslations("statistics");
  const { year: yearParam, currency: currencyParam } = await searchParams;
  const year = yearParam ? parseInt(yearParam, 10) || undefined : undefined;

  // Only the summary is on the critical path. It's a precomputed
  // backend aggregate and it's what the header's filters and the chart
  // are built from, so the page can render everything above the fold
  // without waiting on the much heavier full-envelope fetch that only
  // the breakdowns below need - that one streams in behind its own
  // Suspense boundary.
  const summary = await getDashboardSummary(year, currencyParam);

  // The year is only worth showing when the range actually spans more
  // than one - within a single year "Aug" alone reads fine, and the
  // extra token is what used to make the axis labels crowd. This lived
  // in the backend until it started sending raw month keys.
  const spansMultipleYears =
    new Set(summary.chart.map((entry) => entry.month.slice(0, 4))).size > 1;

  const chartData = summary.chart.map((entry) => ({
    label: formatMonthKey(entry.month, locale, spansMultipleYears),
    spent: entry.spent,
    available: entry.available,
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
          {/* Hidden above md: the app header shows the section name
              there. The subtitle below stays - it says something the
              header does not. */}
          <Heading as="h1" size="lg" className="md:hidden">
            {t("title")}
          </Heading>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
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
          year={year}
        />
      </Suspense>
    </div>
  );
}

interface BreakdownSectionProps {
  totals: (DashboardSummary["totals"][number] & { currency: CurrencyCode })[];
  chartCurrency: CurrencyCode;
  hasMultipleCurrencies: boolean;
  /** Same year filter the summary was fetched with, so the breakdown
   * covers the same period as the chart above it. */
  year?: number;
}

/**
 * The two breakdown cards. Split out of the page body so the header,
 * the filters and the chart render without waiting on this section's own
 * fetch.
 */
async function BreakdownSection({
  totals,
  chartCurrency,
  hasMultipleCurrencies,
  year,
}: BreakdownSectionProps) {
  const t = await getTranslations("statistics");
  // Aggregated by the backend, scoped to the same currency the chart
  // is, so the two widgets tell one consistent story. This used to fetch
  // every envelope (capped at 100) and reduce over it, which silently
  // dropped categories once an account passed that cap - the last place
  // in the app that did so.
  const breakdownRows = await getCategoryBreakdown(chartCurrency, year);

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
          <CardTitle>{t("byCategory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryBreakdown rows={breakdownRows} currency={chartCurrency} />
        </CardContent>
      </Card>

      {hasMultipleCurrencies && (
        <Card className="border-0 bg-card/50 shadow-sm">
          <CardHeader>
            <CardTitle>{t("byCurrency")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyBreakdown totals={totals} />
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
