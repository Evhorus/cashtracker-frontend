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
   * "none": no action at either breakpoint (the account page).
   * "single": one action, same on both breakpoints.
   * "icon-pair": two small icon buttons on desktop (edit/delete),
   * collapsing to one icon button on mobile (an actions-menu trigger).
   * "back-edit-delete": the envelope and expense detail pages - a Volver
   * button plus labeled Editar/Eliminar pills on desktop, collapsing to
   * one icon button on mobile (an actions-menu trigger).
   *
   * On desktop these sit on their own row beneath the title, matching
   * PageHeader - the title row there holds only the title and the
   * breadcrumb.
   */
  actions?: "none" | "single" | "icon-pair" | "back-edit-delete";
  /** False where the real page renders no breadcrumb - only the summary
   * page, which is the root of the trail. */
  withBreadcrumb?: boolean;
}

/**
 * Mirrors PageHeader's actual layout: a title row (back button and
 * title on the left, breadcrumb on the right) and, on desktop, a second
 * row of actions beneath it. Mobile's single action stays on the title
 * row, as it does in the real thing.
 */
export const PageHeaderSkeleton = ({
  withBackButton = true,
  withDescription = true,
  actions = "single",
  withBreadcrumb = true,
}: PageHeaderSkeletonProps) => {
  const hasMobileAction = actions !== "none";

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* md:hidden - matches PageHeader itself: desktop has the
              persistent sidebar nav, so the real back button never
              renders there either. Desktop's own back button lives in
              the actions row below, for "back-edit-delete" pages. */}
          {withBackButton && (
            <Skeleton className="h-10 w-10 shrink-0 rounded-full md:hidden" />
          )}

          <div className="space-y-1.5">
            <Skeleton className="h-8 w-48 md:w-64" />
            {withDescription && <Skeleton className="h-4 w-32" />}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          {withBreadcrumb && <Skeleton className="hidden h-4 w-48 md:block" />}
          {hasMobileAction && (
            <Skeleton className="h-9 w-9 rounded-md md:hidden" />
          )}
        </div>
      </div>

      {actions === "single" && (
        <div className="hidden justify-end md:flex">
          <Skeleton className="h-10 w-36" />
        </div>
      )}

      {actions === "icon-pair" && (
        <div className="hidden items-center justify-end gap-1 md:flex">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      )}

      {actions === "back-edit-delete" && (
        <div className="hidden items-center justify-end gap-2 md:flex">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      )}
    </div>
  );
};
