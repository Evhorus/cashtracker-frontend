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

      {/* Matches EnvelopesFilter: the search box, then the status
          filter tabs row (Todos/Activos/En alerta/Excedidos/Sin
          límite) - without this the whole filter bar would pop in
          after the skeleton, shifting everything below it down. */}
      <div className="space-y-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full sm:w-96" />
      </div>

      <EnvelopesResultsSkeleton />
    </div>
  );
}
