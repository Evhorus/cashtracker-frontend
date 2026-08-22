import { auth } from "@clerk/nextjs/server";
import { getEnvelopesAction } from "@/features/envelopes/actions/get-envelopes.action";
import { EnvelopesGrid } from "@/features/envelopes/components/envelopes-grid";
import { EnvelopesFilter } from "@/features/envelopes/components/envelopes-filter";
import { CreateEnvelopeDialog } from "@/features/envelopes/components/create-envelope-dialog";
import { PageHeader } from "@/components/common/page-header";
import { PaginationControls } from "@/components/common/pagination-controls";

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

const ENVELOPES_PER_PAGE = 12;

interface EnvelopesPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function EnvelopesPage({
  searchParams,
}: EnvelopesPageProps) {
  await auth.protect();
  const { page: pageParam, search } = await searchParams;
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;

  const envelopes = await getEnvelopesAction({
    page,
    limit: ENVELOPES_PER_PAGE,
    search,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Sobres"
        description="Gestiona todos tus sobres"
        backUrl="/dashboard"
        actions={<CreateEnvelopeDialog />}
        mobileActions={<CreateEnvelopeDialog />}
      />

      <EnvelopesFilter />

      <EnvelopesGrid envelopes={envelopes.data} searchQuery={search} />

      <PaginationControls
        page={envelopes.meta.page}
        totalPages={envelopes.meta.totalPages}
        hasNextPage={envelopes.meta.hasNextPage}
        hasPreviousPage={envelopes.meta.hasPreviousPage}
        basePath="/dashboard/envelopes"
        searchParams={{ search }}
      />
    </div>
  );
}
