import { cn } from "@/lib/utils";

interface ListFilterBarProps {
  /** Filter controls, below the search box. Optional: the list pages
   * render their status/type filter up in the PageHeader beside the
   * create button on desktop, and only pass it here for mobile. With no
   * filter beside it the search sits left, under the title and near the
   * table it filters - right-aligned it read as isolated top-right with
   * an empty row around it, which is what moving it out of the header
   * was meant to fix in the first place. */
  filters?: React.ReactNode;
  /** Render prop, not a plain node - this shell mounts the search box
   * twice (full-width above the filters on mobile, compact beside them
   * on desktop) so each copy gets the right className, the same
   * two-instances-toggled-by-CSS pattern PageHeader already uses for
   * actions/mobileActions. A single shared instance can't do this: it
   * would have to pick one fixed width for both breakpoints. */
  renderSearch: (className: string) => React.ReactNode;
  /**
   * Page-level action (the create button), pinned to the right end of
   * the same row as the search and filter. Desktop only: below `md` the
   * create action renders in PageHeader's `mobileActions` instead, as an
   * icon beside the title, which is where it fits on a phone.
   */
  actions?: React.ReactNode;
  className?: string;
}

// Shared shape for every searchable list/table page (envelopes,
// categories, ...): search stacked full-width above the filter tabs on
// mobile; the two sharing one row on desktop, search compact on the
// right - directly above the table it filters, instead of isolated in
// the page header far from both the title and the table on a wide
// viewport (that's what this replaced on both pages it's used on).
// Add a new searchable list by composing this with its own search/
// filters, not by copy-pasting the responsive wrapper markup again.
export function ListFilterBar({
  filters,
  renderSearch,
  actions,
  className,
}: ListFilterBarProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Mobile: full-width search, filter stacked under it. */}
      {renderSearch("md:hidden")}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* Desktop: the two sit side by side, left-aligned under the
            title and close to the table they filter. Right-aligned they
            read as isolated top-right with an empty row around them,
            which is what moving the search out of the PageHeader was
            meant to fix. */}
        {renderSearch("hidden w-64 shrink-0 md:block")}
        {/* min-w-0 so this can shrink in the flex row rather than
            forcing the page wider - the failure the tab row this
            replaced actually hit on a phone. */}
        {filters && <div className="min-w-0">{filters}</div>}
        {actions && (
          <div className="hidden md:ml-auto md:flex md:items-center md:gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
