import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { EnvelopesResultsSkeleton } from "@/features/envelopes/components/envelopes-list-skeleton";

export default function EnvelopesLoading() {
  return (
    <div className="space-y-6">
      {/* No description line - the real PageHeader on this page doesn't
          pass one anymore, its count moved into EnvelopesResultsSkeleton
          below (see envelopes/page.tsx). No action row either: this
          page's create button lives on the controls row below, not in
          the header. */}
      <PageHeaderSkeleton withDescription={false} actions="none" />

      {/* Matches ListFilterBar as EnvelopesFilter composes it: mobile
          gets a full-width search then a full-width status select;
          desktop puts the two side by side with the create button pinned
          right. Without this the whole row pops in after the skeleton,
          shifting everything below it down. */}
      <div className="space-y-3">
        <Skeleton className="h-9 w-full md:hidden" />
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Skeleton className="hidden h-9 w-64 shrink-0 md:block" />
          <Skeleton className="h-9 w-full sm:w-48" />
          <Skeleton className="hidden h-10 w-36 md:ml-auto md:block" />
        </div>
      </div>

      <EnvelopesResultsSkeleton />
    </div>
  );
}
