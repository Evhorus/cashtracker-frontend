import { Skeleton } from "@/shared/components/ui/skeleton";

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
   * "edit-delete": the envelope and expense detail pages - labelled
   * Editar/Eliminar on desktop, one icon button on mobile.
   */
  actions?: "none" | "single" | "icon-pair" | "edit-delete";
  /** Only pages below a nav section (an envelope, an expense) show a
   * breadcrumb - see Breadcrumb. */
  withBreadcrumb?: boolean;
}

/**
 * Mirrors PageHeader: the title on the left and, on desktop, the
 * breadcrumb above the actions on the right, in one band. Mobile's
 * single action stays beside the title, as in the real thing.
 */
export const PageHeaderSkeleton = ({
  withBackButton = true,
  withDescription = true,
  actions = "single",
  withBreadcrumb = false,
}: PageHeaderSkeletonProps) => {
  const hasMobileAction = actions !== "none";

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* md:hidden - the real back button is mobile-only too. */}
        {withBackButton && (
          <Skeleton className="h-10 w-10 shrink-0 rounded-full md:hidden" />
        )}

        <div className="space-y-1.5">
          <Skeleton className="h-8 w-48 md:w-64" />
          {withDescription && <Skeleton className="h-4 w-32" />}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4 md:flex-col md:items-end md:gap-3">
        {withBreadcrumb && <Skeleton className="hidden h-4 w-48 md:block" />}

        {actions === "single" && (
          <Skeleton className="hidden h-10 w-36 md:block" />
        )}
        {actions === "icon-pair" && (
          <div className="hidden items-center gap-1 md:flex">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        )}
        {actions === "edit-delete" && (
          <div className="hidden items-center gap-2 md:flex">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        )}

        {hasMobileAction && (
          <Skeleton className="h-9 w-9 rounded-md md:hidden" />
        )}
      </div>
    </div>
  );
};
