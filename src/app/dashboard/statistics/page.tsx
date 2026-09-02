import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getLocale, getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { formatMonthKey } from "@/lib/date-helpers";
import { getDashboardSummary } from "@/features/dashboard/data/get-dashboard-summary";
import { getCategoryBreakdown } from "@/features/dashboard/data/get-category-breakdown";
import { getEnvelopeBreakdown } from "@/features/dashboard/data/get-envelope-breakdown";
import { getNameBreakdown } from "@/features/dashboard/data/get-name-breakdown";
import { getBreakdownTotal } from "@/features/dashboard/data/get-breakdown-total";
import { YearFilterSelect } from "@/features/dashboard/components/year-filter-select";
import { CurrencyFilterSelect } from "@/features/dashboard/components/currency-filter-select";
import { DateRangeFilter } from "@/features/dashboard/components/date-range-filter";
import nextDynamic from "next/dynamic";
import { MonthlySpendingChartSkeleton } from "@/components/common/monthly-spending-chart-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heading } from "@/components/common/typography";
import { BreakdownTabs } from "@/features/dashboard/components/breakdown-tabs";
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
  searchParams: Promise<{
    year?: string;
    currency?: string;
    startDate?: string;
    endDate?: string;
  }>;
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
  const {
    year: yearParam,
    currency: currencyParam,
    startDate,
    endDate,
  } = await searchParams;
  const year = yearParam ? parseInt(yearParam, 10) || undefined : undefined;
  // An exact range wins over the year shortcut when the URL somehow
  // carries both (hand-edited, stale) - same precedence the backend
  // applies (see BreakdownQueryDto), so the chart above and the
  // breakdown tabs below can never disagree about which one is active.
  const hasDateRange = Boolean(startDate && endDate);

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
          <Heading as="h1" size="lg">
            {t("title")}
          </Heading>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* This page has its own header row rather than PageHeader (no
              backUrl, and a subtitle plus filters PageHeader doesn't
              fit), so it needs the breadcrumb wired explicitly to match
              the other pages. */}
          <Breadcrumb current={t("title")} className="hidden md:block" />

          {(summary.availableYears.length > 0 || hasMultipleCurrencies) && (
            <div className="flex flex-wrap items-center gap-2">
              {summary.availableYears.length > 0 && (
                <YearFilterSelect
                  years={summary.availableYears}
                  selectedYear={year}
                />
              )}
              <DateRangeFilter startDate={startDate} endDate={endDate} />
              {hasMultipleCurrencies && (
                <CurrencyFilterSelect
                  currencies={totals.map((total) => total.currency)}
                  selectedCurrency={chartCurrency}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <MonthlySpendingChart
        chartData={chartData}
        totalEnvelopes={summary.totalEnvelopes}
        currency={chartCurrency}
        hasOtherCurrencies={hasMultipleCurrencies}
      />

      {/* Keyed on the active filters so changing year/currency/date
          range re-shows the fallback instead of silently swapping
          content once ready - the same visible "yes, that click
          registered" feedback the envelopes list uses, and the reason
          the filter controls above sit outside this boundary. */}
      <Suspense
        key={`${year ?? ""}-${chartCurrency}-${startDate ?? ""}-${endDate ?? ""}`}
        fallback={<BreakdownSkeleton multiCurrency={hasMultipleCurrencies} />}
      >
        <BreakdownSection
          totals={totals}
          chartCurrency={chartCurrency}
          hasMultipleCurrencies={hasMultipleCurrencies}
          year={hasDateRange ? undefined : year}
          startDate={hasDateRange ? startDate : undefined}
          endDate={hasDateRange ? endDate : undefined}
        />
      </Suspense>
    </div>
  );
}

interface BreakdownSectionProps {
  totals: (DashboardSummary["totals"][number] & { currency: CurrencyCode })[];
  chartCurrency: CurrencyCode;
  hasMultipleCurrencies: boolean;
  /** The period every breakdown tab is scoped to - an exact range wins
   * over `year` (page body above already resolves that), either or
   * neither may be set. */
  year?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * The breakdown card (four tabs) plus the currency card. Split out of
 * the page body so the header, the filters and the chart render
 * without waiting on this section's own fetch.
 */
async function BreakdownSection({
  totals,
  chartCurrency,
  hasMultipleCurrencies,
  year,
  startDate,
  endDate,
}: BreakdownSectionProps) {
  const t = await getTranslations("statistics");
  const filters = { currency: chartCurrency, year, startDate, endDate };
  // All four aggregated by the backend, scoped to the same
  // currency/period so every tab and the currency card beside it tell
  // one consistent story. Category breakdown used to fetch every
  // envelope (capped at 100) and reduce over it, which silently dropped
  // categories once an account passed that cap - the last place in the
  // app that did so.
  const [categoryRows, envelopeRows, nameRows, total] = await Promise.all([
    getCategoryBreakdown(filters),
    getEnvelopeBreakdown(filters),
    getNameBreakdown(filters),
    getBreakdownTotal(filters),
  ]);

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
          <CardTitle>{t("breakdownTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <BreakdownTabs
            categoryRows={categoryRows}
            envelopeRows={envelopeRows}
            nameRows={nameRows}
            total={total}
            currency={chartCurrency}
          />
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
