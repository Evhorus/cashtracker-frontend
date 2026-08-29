import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { getEnvelopes } from "@/features/envelopes/data/get-envelopes";
import { EnvelopesGrid } from "@/features/envelopes/components/envelopes-grid";
import { EnvelopesFilter } from "@/features/envelopes/components/envelopes-filter";
import { CreateEnvelopeDialog } from "@/features/envelopes/components/create-envelope-dialog";
import { PageHeader } from "@/components/common/page-header";
import { PaginationControls } from "@/components/common/pagination-controls";
import { Text } from "@/components/common/typography";
import { EnvelopesResultsSkeleton } from "@/features/envelopes/components/envelopes-list-skeleton";
import {
  ENVELOPE_STATUS_TAB_VALUES,
  type EnvelopeStatusTab,
} from "@/features/envelopes/lib/envelope-helpers";

// generateMetadata, not a static `metadata` object: the tab title has
// to follow the reader's language, and a module-level constant is
// evaluated once at build time with no request (and so no locale) in
// scope. Same reason every other page in this app switched.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("envelopes");
  return { title: t("title") };
}

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

const ENVELOPES_PER_PAGE = 12;

interface EnvelopesPageProps {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}

export default async function EnvelopesPage({
  searchParams,
}: EnvelopesPageProps) {
  await auth.protect();
  const t = await getTranslations("envelopes");
  const { page: pageParam, search, status: statusParam } = await searchParams;
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  const status: EnvelopeStatusTab = ENVELOPE_STATUS_TAB_VALUES.some(
    (filter) => filter === statusParam,
  )
    ? (statusParam as EnvelopeStatusTab)
    : "all";

  return (
    <div className="space-y-6">
      {/* Static - no live count here anymore (see EnvelopesCount below).
          Tying this to the fetch meant the whole header sat inside the
          same Suspense boundary as the slow part, so clicking a status
          tab froze the header along with it instead of reacting
          instantly. */}
      <PageHeader
        title={t("title")}
        backUrl="/dashboard"
        actions={<CreateEnvelopeDialog />}
        mobileActions={<CreateEnvelopeDialog />}
      />

      {/* Outside the Suspense boundary below on purpose - EnvelopesFilter
          is pure client UI (its active tab/search value reads the URL
          directly via useSearchParams), so it re-renders instantly on
          click regardless of how slow the actual data fetch is. Without
          this split, the entire page was one async Server Component, so
          a transition had nothing to commit until the backend responded
          - the tab click just sat there looking unresponsive. */}
      <EnvelopesFilter />

      {/* key remounts this boundary (and re-shows the fallback) on every
          filter change instead of quietly swapping content once ready -
          the visible "yes, that click registered" feedback the tabs
          alone can't give while the new list is still loading. */}
      <Suspense
        key={`${page}-${search ?? ""}-${status}`}
        fallback={
          <div className="space-y-6">
            <EnvelopesResultsSkeleton />
          </div>
        }
      >
        <EnvelopesResults page={page} search={search} status={status} />
      </Suspense>
    </div>
  );
}

interface EnvelopesResultsProps {
  page: number;
  search?: string;
  status: EnvelopeStatusTab;
}

async function EnvelopesResults({
  page,
  search,
  status,
}: EnvelopesResultsProps) {
  const t = await getTranslations("envelopes");
  // The backend applies the status filter in SQL, so `meta` counts the
  // filtered set and one page is one request. This used to fetch every
  // envelope (capped at 100) and filter/paginate in memory, which meant
  // the count and the tabs quietly under-reported once an account passed
  // that cap - and, in a finance app, silently incomplete numbers are the
  // worst kind of wrong.
  const { data, meta } = await getEnvelopes({
    page,
    limit: ENVELOPES_PER_PAGE,
    search,
    status,
  });

  // meta.total is already scoped to `search`/`status` - a live count of
  // whatever's actually showing, not a fixed page size, and correctly
  // reads as "3 envelopes" while filtering instead of a static subtitle that
  // never moves. No budget total alongside it - envelopes span multiple
  // currencies (COP/USD/EUR), and summing across them into one number
  // would be meaningless, same reasoning as everywhere else in the app
  // that keeps currency totals separate.
  const total = meta.total;

  return (
    <div className="space-y-6">
      <Text>{t("count", { count: total })}</Text>

      <EnvelopesGrid
        envelopes={data}
        searchQuery={search}
        statusFilter={status}
      />

      <PaginationControls
        page={meta.page}
        totalPages={meta.totalPages}
        hasNextPage={meta.hasNextPage}
        hasPreviousPage={meta.hasPreviousPage}
        basePath="/dashboard/envelopes"
        searchParams={{ search, status: status === "all" ? undefined : status }}
      />
    </div>
  );
}
