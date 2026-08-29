import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the Resumen page's own shell and its two Suspense fallbacks
// (see dashboard/page.tsx), so this route-level skeleton hands over to
// the page without the layout jumping. It used to show a single hero
// card over two small tiles, which matched neither the hero row (one
// card per currency, beside the tiles when there's only one) nor the two
// widget cards below it.
export default function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-4 w-52" />
        <Skeleton className="mt-0.5 h-9 w-56" />
      </div>

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
    </div>
  );
}
