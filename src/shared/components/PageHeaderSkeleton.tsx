import { Skeleton } from "@/shared/components/ui/skeleton";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderSkeletonProps {
  withBackButton?: boolean;
}

export const PageHeaderSkeleton = ({
  withBackButton = true,
}: PageHeaderSkeletonProps) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0 w-full">
        {withBackButton && (
          <Button
            variant="outline"
            size="icon"
            disabled
            className="h-10 w-10 rounded-full border-muted-foreground/20 shrink-0"
          >
            <ArrowLeft className="h-5 w-5 opacity-50" />
          </Button>
        )}

        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-8 w-48 md:w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <Skeleton className="h-10 w-full md:w-32" />
        <Skeleton className="h-10 w-full md:w-32 hidden md:block" />
      </div>
    </div>
  );
};
