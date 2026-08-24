import { auth } from "@clerk/nextjs/server";
import { getEnvelopesAction } from "@/features/envelopes/actions/get-envelopes.action";
import { EnvelopesGrid } from "@/features/envelopes/components/envelopes-grid";
import { EnvelopesFilter } from "@/features/envelopes/components/envelopes-filter";
import { CreateEnvelopeDialog } from "@/features/envelopes/components/create-envelope-dialog";
import { PageHeader } from "@/components/common/page-header";
import { PaginationControls } from "@/components/common/pagination-controls";
import {
  ENVELOPE_STATUS_FILTERS,
  EnvelopeHelpers,
  type EnvelopeStatusFilter,
} from "@/features/envelopes/lib/envelope-helpers";

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

const ENVELOPES_PER_PAGE = 12;

// Same cap the account/statistics pages use for "give me every envelope
// to compute something client/server-side over" - see their comments.
// Needed here because the "Activos/Excedidos/Sin límite" status tabs have
// no backend query param (status is derived from spent/amount, not
// stored), so filtering has to happen after fetching a full, unpaginated
// list rather than on whatever single page the backend would return.
const ALL_ENVELOPES_LIMIT = 100;

interface EnvelopesPageProps {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}

export default async function EnvelopesPage({
  searchParams,
}: EnvelopesPageProps) {
  await auth.protect();
  const {
    page: pageParam,
    search,
    status: statusParam,
  } = await searchParams;
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  const status: EnvelopeStatusFilter = ENVELOPE_STATUS_FILTERS.some(
    (filter) => filter.value === statusParam,
  )
    ? (statusParam as EnvelopeStatusFilter)
    : "all";

  let data;
  let meta;

  if (status === "all") {
    const envelopes = await getEnvelopesAction({
      page,
      limit: ENVELOPES_PER_PAGE,
      search,
    });
    data = envelopes.data;
    meta = envelopes.meta;
  } else {
    // Fetch every matching envelope, filter by status, then paginate
    // in-memory - see ALL_ENVELOPES_LIMIT above.
    const envelopes = await getEnvelopesAction({
      limit: ALL_ENVELOPES_LIMIT,
      search,
    });
    const filtered = envelopes.data.filter((envelope) =>
      EnvelopeHelpers.matchesStatusFilter(envelope, status),
    );
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / ENVELOPES_PER_PAGE));
    const clampedPage = Math.min(page, totalPages);
    const start = (clampedPage - 1) * ENVELOPES_PER_PAGE;

    data = filtered.slice(start, start + ENVELOPES_PER_PAGE);
    meta = {
      total,
      page: clampedPage,
      limit: ENVELOPES_PER_PAGE,
      totalPages,
      hasNextPage: clampedPage < totalPages,
      hasPreviousPage: clampedPage > 1,
    };
  }

  // meta.total is already scoped to `search`/`status` - a live count of
  // whatever's actually showing, not a fixed page size, and correctly
  // reads as "3 sobres" while filtering instead of a static subtitle that
  // never moves. No budget total alongside it - envelopes span multiple
  // currencies (COP/USD/EUR), and summing across them into one number
  // would be meaningless, same reasoning as everywhere else in the app
  // that keeps currency totals separate.
  const total = meta.total;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sobres"
        description={`${total} ${total === 1 ? "sobre" : "sobres"}`}
        backUrl="/dashboard"
        actions={<CreateEnvelopeDialog />}
        mobileActions={<CreateEnvelopeDialog />}
      />

      <EnvelopesFilter />

      <EnvelopesGrid envelopes={data} searchQuery={search} statusFilter={status} />

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
