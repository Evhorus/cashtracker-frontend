import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Mirrors AccountView's layout (a Select on mobile, a sidebar list on
// desktop, beside a content column) so nothing shifts once the real
// content mounts - see account-view.tsx.
export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header - no actions on this page, unlike PageHeaderSkeleton's
          default shape (see envelopes/loading.tsx). */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Mobile: one bar (the Select). Desktop: the sidebar list. */}
        <Skeleton className="h-9 w-full md:hidden" />
        <div className="hidden md:flex md:w-52 md:shrink-0 md:flex-col md:gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>

        <div className="min-w-0 flex-1">
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
    </div>
  );
}
