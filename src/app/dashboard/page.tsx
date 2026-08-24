import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { TriangleAlert, Wallet } from "lucide-react";
import { getDashboardSummaryAction } from "@/features/dashboard/actions/get-dashboard-summary.action";
import { getRecentExpensesAction } from "@/features/dashboard/actions/get-recent-expenses.action";
import { getEnvelopesAction } from "@/features/envelopes/actions/get-envelopes.action";
import { HeroBalanceCard } from "@/components/common/hero-balance-card";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";
import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";
import { CategoryIcon } from "@/features/categories/components/category-badge";
import { formatDate } from "@/lib/date-helpers";
import { CURRENCY_MAP, formatCurrency, type CurrencyCode } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

// Resumen (glanceable overview): the hero balance card(s) - one per
// currency in use - a quick envelope/alert count, and (only when there
// actually are any) a short list of envelopes in warning/exceeded status.
// No year/currency filters and no chart - those live on
// /dashboard/statistics, since they're for digging into history rather
// than a quick "how am I doing". Always the default/current period.
export default async function DashboardPage() {
  await auth.protect();

  const [user, summary, envelopesResult, recentExpenses] = await Promise.all([
    // Only the first name, for the greeting below - real Clerk profile
    // data, not a placeholder.
    currentUser(),
    getDashboardSummaryAction(),
    // Only real envelope data available for computing "en alerta" - the
    // summary endpoint doesn't return this, it's derived client-side the
    // same way statistics/page.tsx derives its category breakdown.
    getEnvelopesAction({ limit: 100 }),
    // For the "Actividad reciente" widget below - the last few expenses
    // across every envelope, own endpoint since it's cross-envelope data
    // the summary/envelope-list responses don't carry.
    getRecentExpensesAction(5),
  ]);

  const totals = summary.totals.map((total) => ({
    ...total,
    currency: total.currency as CurrencyCode,
  }));

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

  const alertEnvelopes = envelopesResult.data
    .map((envelope) => ({
      envelope,
      status: EnvelopeHelpers.getProgressStatus(envelope),
      percentage: EnvelopeHelpers.getPercentage(envelope) ?? 0,
    }))
    .filter(({ status }) => status === "warning" || status === "exceeded")
    .sort((a, b) => b.percentage - a.percentage);

  // Built once, reused in both layouts below - with one currency they
  // move up alongside the lone hero card instead of sitting in their
  // own full-width row (see the flex-wrap comment further down).
  const sobresActivosTile = (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Wallet className="h-4 w-4" />
      </div>
      <span className="text-sm text-muted-foreground">Sobres activos</span>
      <span className="ml-auto font-mono text-lg font-semibold">
        {summary.totalEnvelopes}
      </span>
    </div>
  );

  const enAlertaTile = (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3.5">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          alertEnvelopes.length > 0
            ? "bg-amber-500/10 text-amber-500"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <TriangleAlert className="h-4 w-4" />
      </div>
      <span className="text-sm text-muted-foreground">En alerta</span>
      <span className="ml-auto font-mono text-lg font-semibold">
        {alertEnvelopes.length}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {formatDate(new Date())}
        </p>
        <h1 className="mt-0.5 text-3xl font-bold">
          {user?.firstName ? `Hola, ${user.firstName}` : "Resumen"}
        </h1>
      </div>

      {/* flex-wrap instead of a fixed grid-cols-2: a CSS Grid track
          stretches to fill its column no matter how little content is
          in it, which either left a blank second column (1 currency)
          or blew up a lone card to full width with the same sparse
          content just spread thinner (an odd count, e.g. 3 currencies)
          - neither looked right. Each card gets a fixed, content-sized
          width instead of a stretchy one, so it's the same size
          regardless of how many there are.
          With exactly one currency, that leaves the other half of the
          row empty - Sobres activos/En alerta move up into it instead
          of sitting in their own full-width row below, so the space
          left by the hero card actually gets used. items-start so that
          shorter two-tile column doesn't get stretched to the hero
          card's height. */}
      {totals.length === 1 ? (
        <div className="flex flex-wrap items-start gap-4">
          <HeroBalanceCard
            currency={totals[0].currency}
            totalAssigned={totals[0].totalAssigned}
            totalSpent={totals[0].totalSpent}
            totalSpentCapped={totals[0].totalSpentCapped}
            totalAvailable={totals[0].totalAvailable}
            deltaPercent={
              totals[0].currency === summary.chartCurrency
                ? deltaPercent
                : null
            }
            className="w-full md:w-[calc(50%-0.5rem)]"
          />
          <div className="flex w-full flex-col gap-4 md:w-[calc(50%-0.5rem)]">
            {sobresActivosTile}
            {enAlertaTile}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4">
            {totals.map((total) => (
              <HeroBalanceCard
                key={total.currency}
                currency={total.currency}
                totalAssigned={total.totalAssigned}
                totalSpent={total.totalSpent}
                totalSpentCapped={total.totalSpentCapped}
                totalAvailable={total.totalAvailable}
                deltaPercent={
                  total.currency === summary.chartCurrency
                    ? deltaPercent
                    : null
                }
                className="w-full md:w-[calc(50%-0.5rem)]"
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {sobresActivosTile}
            {enAlertaTile}
          </div>
        </>
      )}

      {(alertEnvelopes.length > 0 || recentExpenses.length > 0) && (
        // Side by side on desktop instead of both stacked full-width -
        // two short cards stretched edge to edge left a lot of dead
        // horizontal space either side of their actual content. Whichever
        // one is empty (either can be, independently) lets the other take
        // the full row instead of leaving a blank column next to it.
        // items-start so the two cards size to their own content instead
        // of Grid's default stretch - "Sobres en alerta" is capped at 3
        // rows and "Actividad reciente" at 5, so they're rarely the same
        // height, and stretching the shorter one to match just pads it
        // with dead space instead of growing each independently.
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {alertEnvelopes.length > 0 && (
            <div
              className={cn(
                "rounded-2xl border border-border/60 bg-card/50 p-5",
                recentExpenses.length === 0 && "lg:col-span-2",
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Sobres en alerta</h2>
                <Link
                  href="/dashboard/envelopes?status=alert"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Ver todos →
                </Link>
              </div>
              <div className="mt-3 space-y-3">
                {alertEnvelopes
                  .slice(0, 3)
                  .map(({ envelope, status, percentage }) => {
                    const config = CURRENCY_MAP[envelope.currency];
                    const remaining =
                      EnvelopeHelpers.getRemaining(envelope) ?? 0;
                    const barColorClass =
                      status === "exceeded" ? "bg-destructive" : "bg-amber-500";
                    return (
                      <Link
                        key={envelope.id}
                        href={`/dashboard/envelope/${envelope.id}`}
                        className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-muted"
                      >
                        <CategoryIcon
                          category={envelope.category}
                          className="h-8 w-8 rounded-lg"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="truncate font-medium">
                              {envelope.name}
                            </span>
                            <span
                              className={`ml-2 shrink-0 font-mono text-xs font-semibold ${
                                status === "exceeded"
                                  ? "text-destructive"
                                  : "text-amber-500"
                              }`}
                            >
                              {formatCurrency(remaining, config)}
                            </span>
                          </div>
                          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary/60">
                            <div
                              className={`h-full rounded-full ${barColorClass}`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          )}

          {recentExpenses.length > 0 && (
            <RecentActivity
              expenses={recentExpenses}
              className={cn(alertEnvelopes.length === 0 && "lg:col-span-2")}
            />
          )}
        </div>
      )}
    </div>
  );
}
