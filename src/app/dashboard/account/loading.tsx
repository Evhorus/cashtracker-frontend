import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AccountLoading() {
  return (
    <div className="space-y-6">
      {/* Header - no actions on this page, unlike PageHeaderSkeleton's
          default shape (see envelopes/loading.tsx). */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      <div className="grid max-w-2xl gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-1.5">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="gap-y-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
