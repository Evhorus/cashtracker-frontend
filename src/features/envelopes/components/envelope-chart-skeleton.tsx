import { Skeleton } from "@/components/ui/skeleton";

// Mirrors EnvelopeChart's own layout (no Card wrapper - it's embedded
// inside the envelope detail page's summary panel), so swapping between
// this and the loaded chart doesn't shift the surrounding panel's size.
export const EnvelopeChartSkeleton = () => {
  return (
    <div className="flex items-center justify-center py-2">
      <Skeleton className="aspect-square h-48 max-h-48 rounded-full" />
    </div>
  );
};
