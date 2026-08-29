import type { Metadata } from "next";
import { Suspense } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getLocale, getTranslations } from "next-intl/server";
import { TriangleAlert, Wallet } from "lucide-react";
import { getDashboardSummary } from "@/features/dashboard/data/get-dashboard-summary";
import { getRecentExpenses } from "@/features/dashboard/data/get-recent-expenses";
import { getEnvelopes } from "@/features/envelopes/data/get-envelopes";
import { HeroBalanceCard } from "@/components/common/hero-balance-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { Heading } from "@/components/common/typography";
import { CreateEnvelopeDialog } from "@/features/envelopes/components/create-envelope-dialog";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";
import { AlertEnvelopes } from "@/features/dashboard/components/alert-envelopes";
import { SummaryTile } from "@/features/dashboard/components/summary-tile";
import {
  getAlertEnvelopes,
  getMonthOverMonthDelta,
} from "@/features/dashboard/lib/dashboard-summary";
import { formatDate } from "@/lib/date-helpers";
import { type CurrencyCode } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");
  return { title: t("title") };
}

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

// The alert widget shows the three worst envelopes, so it needs them
// ordered by how far over they are - which the backend doesn't sort by.
// It asks for the alerting ones only (a much smaller set than every
// envelope) and sorts those. The COUNT on the tile comes from
// `meta.total`, so it is exact regardless of this cap.
const ALERT_ENVELOPES_LIMIT = 100;

/**
 * Resumen (glanceable overview): the hero balance card(s) - one per
 * currency in use - a quick envelope/alert count, and (only when there
 * actually are any) a short list of envelopes in warning/exceeded
 * status. No year/currency filters and no chart - those live on
 * /dashboard/statistics, since they're for digging into history rather
 * than a quick "how am I doing". Always the default/current period.
 *
 * The page shell (the date line) renders immediately and the two async
 * regions stream in behind their own Suspense boundaries, rather than
 * the whole page waiting on the slowest of four fetches - the same split
 * the envelopes list already uses.
 */
export default async function DashboardPage() {
  await auth.protect();
  const locale = await getLocale();

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {formatDate(new Date(), locale)}
        </p>
        {/* Its own boundary: the greeting needs a Clerk profile round
            trip (currentUser()), which has nothing to do with the
            budget data below and shouldn't hold it up. */}
        <Suspense fallback={<Skeleton className="mt-0.5 h-9 w-56" />}>
          <Greeting />
        </Suspense>
      </div>

      <Suspense fallback={<SummarySkeleton />}>
        <DashboardSummarySection />
      </Suspense>
    </div>
  );
}

async function Greeting() {
  // Only the first name - real Clerk profile data, not a placeholder.
  const [user, t] = await Promise.all([
    currentUser(),
    getTranslations("dashboard"),
  ]);

  return (
    <Heading as="h1" size="lg" className="mt-0.5">
      {user?.firstName ? t("greeting", { name: user.firstName }) : t("title")}
    </Heading>
  );
}

async function DashboardSummarySection() {
  const t = await getTranslations("dashboard");
  const [summary, envelopesResult, recentExpenses] = await Promise.all([
    getDashboardSummary(),
    // Filtered in SQL - see cashtracker-backend's status predicate. This
    // used to fetch every envelope and filter in memory, so the "En
    // alerta" count silently under-reported once an account passed the
    // cap.
    getEnvelopes({ status: "alert", limit: ALERT_ENVELOPES_LIMIT }),
    // The last few expenses across every envelope - its own endpoint,
    // since that's cross-envelope data the summary/envelope-list
    // responses don't carry.
    getRecentExpenses(5),
  ]);

  // Brand-new account: without this the page rendered the date, the
  // greeting and two zero counters over a lot of empty space, with no
  // hint of what to do next - the hero cards are driven by `totals`,
  // which is empty until there's an envelope, and both widgets below
  // hide themselves when they have nothing.
  if (summary.totalEnvelopes === 0) {
    return <DashboardEmptyState />;
  }

  const totals = summary.totals.map((total) => ({
    ...total,
    currency: total.currency as CurrencyCode,
  }));

  // Real month-over-month change, never a placeholder - and only ever
  // shown against the one currency the chart is scoped to.
  const deltaPercent = getMonthOverMonthDelta(summary.chart);
  // Already only alerting envelopes; this just orders them worst-first.
  const alertEnvelopes = getAlertEnvelopes(envelopesResult.data);
  // From the filtered query's own count, not the length of the page we
  // happened to fetch.
  const alertCount = envelopesResult.meta.total;

  const tiles = (
    <>
      {/* Every envelope, not a subset - the label used to read "Sobres
          activos" over a count of all of them. */}
      <SummaryTile
        icon={Wallet}
        label={t("totalEnvelopes")}
        value={summary.totalEnvelopes}
        href="/dashboard/envelopes"
      />
      <SummaryTile
        icon={TriangleAlert}
        label={t("onAlert")}
        value={alertCount}
        tone={alertCount > 0 ? "alert" : "muted"}
        href="/dashboard/envelopes?status=alert"
      />
    </>
  );

  const heroCards = totals.map((total) => (
    <HeroBalanceCard
      key={total.currency}
      currency={total.currency}
      totalAssigned={total.totalAssigned}
      totalSpent={total.totalSpent}
      totalSpentCapped={total.totalSpentCapped}
      totalAvailable={total.totalAvailable}
      deltaPercent={
        total.currency === summary.chartCurrency ? deltaPercent : null
      }
      className="w-full md:w-[calc(50%-0.5rem)]"
    />
  ));

  return (
    <>
      {/* flex-wrap instead of a fixed grid-cols-2: a CSS Grid track
          stretches to fill its column no matter how little content is
          in it, which either left a blank second column (1 currency)
          or blew up a lone card to full width with the same sparse
          content just spread thinner (an odd count, e.g. 3 currencies)
          - neither looked right. Each card gets a fixed, content-sized
          width instead of a stretchy one, so it's the same size
          regardless of how many there are.
          With exactly one currency, that leaves the other half of the
          row empty - the count tiles move up into it instead of sitting
          in their own full-width row below, so the space left by the
          hero card actually gets used. items-start so that shorter
          two-tile column doesn't get stretched to the hero card's
          height. */}
      {totals.length === 1 ? (
        <div className="flex flex-wrap items-start gap-4">
          {heroCards}
          <div className="flex w-full flex-col gap-4 md:w-[calc(50%-0.5rem)]">
            {tiles}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4">{heroCards}</div>
          <div className="grid grid-cols-2 gap-4">{tiles}</div>
        </>
      )}

      {(alertEnvelopes.length > 0 || recentExpenses.length > 0) && (
        // Side by side on desktop instead of both stacked full-width -
        // two short cards stretched edge to edge left a lot of dead
        // horizontal space either side of their actual content.
        // Whichever one is empty (either can be, independently) lets the
        // other take the full row instead of leaving a blank column next
        // to it. items-start so the two cards size to their own content
        // instead of Grid's default stretch - the alert list is capped
        // at 3 rows and the activity list at 5, so they're rarely the
        // same height, and stretching the shorter one just pads it with
        // dead space.
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {alertEnvelopes.length > 0 && (
            <AlertEnvelopes
              entries={alertEnvelopes}
              className={cn(recentExpenses.length === 0 && "lg:col-span-2")}
            />
          )}

          {recentExpenses.length > 0 && (
            <RecentActivity
              expenses={recentExpenses}
              className={cn(alertEnvelopes.length === 0 && "lg:col-span-2")}
            />
          )}
        </div>
      )}
    </>
  );
}

// First-run state. Deliberately warmer and more editorial than the
// "no results" states on the list pages - for most people this is the
// very first screen they see signed in, so it explains the envelope idea
// rather than just reporting that a list is empty. Same shape and copy
// direction as EnvelopesGrid's own first-run card, so the two don't read
// like different products.
async function DashboardEmptyState() {
  const t = await getTranslations("dashboard");

  return (
    <EmptyState
      variant="first-run"
      icon={Wallet}
      eyebrow={t("emptyEyebrow")}
      title={t("emptyTitle")}
      description={t("emptyBody")}
      action={<CreateEnvelopeDialog />}
    />
  );
}

// Mirrors the single-currency layout above (one hero card beside the two
// count tiles), which is what the overwhelming majority of accounts see.
function SummarySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <Skeleton className="h-44 w-full rounded-2xl md:w-[calc(50%-0.5rem)]" />
        <div className="flex w-full flex-col gap-4 md:w-[calc(50%-0.5rem)]">
          <Skeleton className="h-[68px] rounded-xl" />
          <Skeleton className="h-[68px] rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
      </div>
    </div>
  );
}
