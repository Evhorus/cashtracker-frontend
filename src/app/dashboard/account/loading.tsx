import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Mirrors AccountView's layout (a Select on mobile, a horizontal top-tab
// row on desktop, above a content column, full page width) so nothing
// shifts once the real content mounts - see account-view.tsx.
export default function AccountLoading() {
  return (
    <div className="space-y-6">
      {/* Header - no actions on this page, unlike PageHeaderSkeleton's
          default shape (see envelopes/loading.tsx). md:hidden on the
          back button - matches PageHeader itself, desktop has the
          sidebar nav instead. */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full md:hidden" />
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Mobile: one bar (the Select). */}
        <Skeleton className="h-9 w-full md:hidden" />

        {/* Desktop: the horizontal top-tab row - 6 varying-width pills
            (roughly matching each section's icon+label length) inside
            the same rounded-2xl/bordered/padded container AccountView's
            real TabsList uses, so this doesn't visibly resize once the
            real tabs mount. */}
        <div className="hidden flex-wrap items-center gap-1.5 rounded-2xl border border-border/60 bg-card/50 p-2.5 md:flex">
          {["w-20", "w-28", "w-24", "w-36", "w-28", "w-32"].map((w, i) => (
            <Skeleton key={i} className={`h-10 ${w} rounded-full`} />
          ))}
        </div>

        <Card>
          <CardHeader className="space-y-1.5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="gap-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-32" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
