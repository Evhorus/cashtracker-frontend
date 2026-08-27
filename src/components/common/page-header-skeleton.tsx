import { Skeleton } from "@/components/ui/skeleton";

interface PageHeaderSkeletonProps {
  withBackButton?: boolean;
  /** False on pages whose real PageHeader passes no `description` (e.g.
   * /dashboard/envelopes, since its count moved out of the header - see
   * that page's own comment) - otherwise this skeleton shows a subtitle
   * line that then vanishes once real content mounts, an extra bit of
   * layout shift the real page never actually has. */
  withDescription?: boolean;
  /**
   * "single": one action, same on both breakpoints (e.g. CreateEnvelopeDialog
   * on /dashboard/envelopes - actions and mobileActions render the identical
   * self-adapting component).
   * "icon-pair": two small icon buttons on desktop (edit/delete), collapsing
   * to one icon button on mobile (an actions-menu trigger) - matches the
   * envelope and expense detail pages.
   */
  actions?: "single" | "icon-pair";
}

// Mirrors PageHeader's actual layout: always a single row (it never stacks
// on mobile - the old version of this skeleton used flex-col on mobile,
// which doesn't match).
export const PageHeaderSkeleton = ({
  withBackButton = true,
  withDescription = true,
  actions = "single",
}: PageHeaderSkeletonProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* md:hidden - matches PageHeader itself: desktop has the
            persistent sidebar nav, so the real back button never renders
            there either. */}
        {withBackButton && (
          <Skeleton className="h-10 w-10 shrink-0 rounded-full md:hidden" />
        )}

        <div className="space-y-1.5">
          <Skeleton className="h-8 w-48 md:w-64" />
          {withDescription && <Skeleton className="h-4 w-32" />}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {actions === "single" ? (
          <>
            {/* Desktop: search box + the create button, inline - matches
                envelopes/page.tsx and categories/page.tsx, both of which
                render their search box in this actions slot instead of
                the content column below it. */}
            <Skeleton className="hidden h-9 w-64 md:block" />
            <Skeleton className="h-10 w-10 md:w-36" />
          </>
        ) : (
          <>
            <div className="hidden items-center gap-1 md:flex">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
            <Skeleton className="h-9 w-9 rounded-md md:hidden" />
          </>
        )}
      </div>
    </div>
  );
};
