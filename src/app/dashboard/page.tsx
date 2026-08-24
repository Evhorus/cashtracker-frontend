import { auth } from "@clerk/nextjs/server";
import { getDashboardSummaryAction } from "@/features/dashboard/actions/get-dashboard-summary.action";
import { StatsCards } from "@/components/common/stats-cards";
import type { CurrencyCode } from "@/lib/format-currency";

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

// Resumen (glanceable overview): just current totals, no year/currency
// filters and no chart - those live on /dashboard/statistics now, since
// they're for digging into history rather than a quick "how am I doing".
// Always the default/current period - see get-dashboard-summary.action.ts.
export default async function DashboardPage() {
  await auth.protect();

  const summary = await getDashboardSummaryAction();

  const totals = summary.totals.map((total) => ({
    ...total,
    currency: total.currency as CurrencyCode,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resumen</h1>
        <p className="mt-1 text-muted-foreground">
          Cómo van tus finanzas hoy
        </p>
      </div>

      <StatsCards totalEnvelopes={summary.totalEnvelopes} totals={totals} />
    </div>
  );
}
