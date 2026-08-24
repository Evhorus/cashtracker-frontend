import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getEnvelopesAction } from "@/features/envelopes/actions/get-envelopes.action";
import { getDashboardSummaryAction } from "@/features/dashboard/actions/get-dashboard-summary.action";
import { YearFilterSelect } from "@/features/dashboard/components/year-filter-select";
import { CurrencyFilterSelect } from "@/features/dashboard/components/currency-filter-select";
import { EnvelopesGrid } from "@/features/envelopes/components/envelopes-grid";
import { CreateEnvelopeDialog } from "@/features/envelopes/components/create-envelope-dialog";
import { Button } from "@/components/ui/button";
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

// Recent envelopes preview on the dashboard - "see all" goes to the
// full paginated list at /dashboard/envelopes.
const RECENT_ENVELOPES_LIMIT = 6;

interface DashboardPageProps {
  searchParams: Promise<{ year?: string; currency?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  await auth.protect();
  const { year: yearParam, currency: currencyParam } = await searchParams;
  const year = yearParam ? parseInt(yearParam, 10) || undefined : undefined;

  const [summary, envelopes] = await Promise.all([
    getDashboardSummaryAction(year, currencyParam),
    getEnvelopesAction({ limit: RECENT_ENVELOPES_LIMIT }),
  ]);

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
      </div>

      <StatsCards totalEnvelopes={summary.totalEnvelopes} totals={totals} />

      <MonthlySpendingChart
        chartData={chartData}
        totalEnvelopes={summary.totalEnvelopes}
        currency={chartCurrency}
        hasOtherCurrencies={hasMultipleCurrencies}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mis Sobres</h2>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/envelopes">
            <Button variant="link">Ver todos</Button>
          </Link>
          <CreateEnvelopeDialog />
        </div>
      </div>

      <EnvelopesGrid envelopes={envelopes.data} />
    </div>
  );
}
