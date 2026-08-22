import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { EnvelopesListSkeleton } from "@/features/envelopes/components/envelopes-list-skeleton";

export default function EnvelopesLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />

      {/* Matches EnvelopesFilter's search box - without this the whole
          filter bar would pop in after the skeleton, shifting everything
          below it down. */}
      <Skeleton className="mb-6 h-9 w-full" />

      <EnvelopesListSkeleton />
    </div>
  );
}
