import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { EnvelopesListSkeleton } from "@/features/envelopes/components/envelopes-list-skeleton";

export default function EnvelopesLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />

      {/* Matches EnvelopesFilter: the search box, then the status
          filter tabs row (Todos/Activos/En alerta/Excedidos/Sin
          límite) - without this the whole filter bar would pop in
          after the skeleton, shifting everything below it down. */}
      <div className="mb-6 space-y-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full sm:w-96" />
      </div>

      <EnvelopesListSkeleton />
    </div>
  );
}
