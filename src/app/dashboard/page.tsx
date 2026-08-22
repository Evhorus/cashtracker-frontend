import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getEnvelopesAction } from "@/features/envelopes/actions/get-envelopes.action";
import { EnvelopesGrid } from "@/features/envelopes/components/envelopes-grid";
import { Button } from "@/components/ui/button";
import nextDynamic from "next/dynamic";
import { EnvelopesSummaryChartSkeleton } from "@/components/common/envelopes-summary-chart-skeleton";
import { StatsCards } from "@/components/common/stats-cards";
import { DashboardHelpers } from "@/lib/dashboard-helpers";

// recharts is a heavy dependency - code-split it into its own chunk,
// only needed once this section of the dashboard renders.
// Aliased to `nextDynamic`: this file also exports the route segment
// config `dynamic = "force-dynamic"` below, which would otherwise
// collide with next/dynamic's default export name.
const EnvelopesSummaryChart = nextDynamic(
  () =>
    import("@/components/common/envelopes-summary-chart").then(
      (mod) => mod.EnvelopesSummaryChart,
    ),
  { loading: () => <EnvelopesSummaryChartSkeleton /> },
);

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await auth.protect();
  const envelopes = await getEnvelopesAction();

  const totalAmount = DashboardHelpers.getTotalAmount(envelopes.data);
  const totalSpent = DashboardHelpers.getTotalSpent(envelopes.data);
  const totalRemaining = DashboardHelpers.getTotalRemaining(envelopes.data);
  const chartData = DashboardHelpers.getChartData(envelopes.data);

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
      </div>

      <StatsCards
        totalAmount={totalAmount}
        totalCount={envelopes.count}
        totalSpent={totalSpent}
        totalRemaining={totalRemaining}
      />

      <EnvelopesSummaryChart
        chartData={chartData}
        totalEnvelopes={envelopes.count}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mis Sobres</h2>
        <Link href="/dashboard/envelopes">
          <Button variant="link">Ver todos</Button>
        </Link>
      </div>

      <EnvelopesGrid envelopes={envelopes.data.slice(0, 6)} />
    </div>
  );
}
