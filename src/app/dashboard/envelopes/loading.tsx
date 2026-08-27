import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { EnvelopesResultsSkeleton } from "@/features/envelopes/components/envelopes-list-skeleton";

export default function EnvelopesLoading() {
  return (
    <div className="space-y-6">
      {/* No description line - the real PageHeader on this page doesn't
          pass one anymore, its count moved into EnvelopesResultsSkeleton
          below (see envelopes/page.tsx). */}
      <PageHeaderSkeleton withDescription={false} />

      {/* Matches EnvelopesFilter: search full-width above the status tabs
          on mobile; tabs + a compact search box sharing one row on
          desktop - without this the whole filter bar would pop in after
          the skeleton, shifting everything below it down. */}
      <div className="space-y-3">
        <Skeleton className="h-9 w-full md:hidden" />
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-9 w-full sm:w-96" />
          <Skeleton className="hidden h-9 w-64 shrink-0 md:block" />
        </div>
      </div>

      <EnvelopesResultsSkeleton />
    </div>
  );
}
