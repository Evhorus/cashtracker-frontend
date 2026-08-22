import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getEnvelopesAction } from "@/features/envelopes/actions/get-envelopes.action";
import { getDashboardSummaryAction } from "@/features/dashboard/actions/get-dashboard-summary.action";
import { YearFilterSelect } from "@/features/dashboard/components/year-filter-select";
import { EnvelopesGrid } from "@/features/envelopes/components/envelopes-grid";
import { Button } from "@/components/ui/button";
import nextDynamic from "next/dynamic";
import { MonthlySpendingChartSkeleton } from "@/components/common/monthly-spending-chart-skeleton";
import { StatsCards } from "@/components/common/stats-cards";

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
  searchParams: Promise<{ year?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  await auth.protect();
  const { year: yearParam } = await searchParams;
  const year = yearParam ? parseInt(yearParam, 10) || undefined : undefined;

  const [summary, envelopes] = await Promise.all([
    getDashboardSummaryAction(year),
    getEnvelopesAction({ limit: RECENT_ENVELOPES_LIMIT }),
  ]);

  const chartData = summary.chart.map((entry) => ({
    label: entry.label,
    Gastado: entry.spent,
    Disponible: entry.available,
  }));

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

        {summary.availableYears.length > 0 && (
          <YearFilterSelect
            years={summary.availableYears}
            selectedYear={year}
          />
        )}
      </div>

      <StatsCards
        totalAmount={summary.totalAssigned}
        totalCount={summary.totalEnvelopes}
        totalSpent={summary.totalSpent}
        totalRemaining={summary.totalAvailable}
      />

      <MonthlySpendingChart
        chartData={chartData}
        totalEnvelopes={summary.totalEnvelopes}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mis Sobres</h2>
        <Link href="/dashboard/envelopes">
          <Button variant="link">Ver todos</Button>
        </Link>
      </div>

      <EnvelopesGrid envelopes={envelopes.data} />
    </div>
  );
}
