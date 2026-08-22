import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderSkeletonProps {
  withBackButton?: boolean;
}

export const PageHeaderSkeleton = ({
  withBackButton = true,
}: PageHeaderSkeletonProps) => {
  return (
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div className="flex w-full min-w-0 flex-1 items-center gap-3">
        {withBackButton && (
          <Button
            variant="outline"
            size="icon"
            disabled
            className="h-10 w-10 shrink-0 rounded-full border-muted-foreground/20"
          >
            <ArrowLeft className="h-5 w-5 opacity-50" />
          </Button>
        )}

        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-8 w-48 md:w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="flex w-full items-center gap-2 md:w-auto">
        <Skeleton className="h-10 w-full md:w-32" />
        <Skeleton className="hidden h-10 w-full md:block md:w-32" />
      </div>
    </div>
  );
};
