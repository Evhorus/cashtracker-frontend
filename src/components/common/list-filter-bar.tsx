import { cn } from "@/lib/utils";

interface ListFilterBarProps {
  /** Status/type tabs (or any other filter control) - left-aligned next
   * to the search box on desktop, below it on mobile. */
  filters: React.ReactNode;
  /** Render prop, not a plain node - this shell mounts the search box
   * twice (full-width above the filters on mobile, compact beside them
   * on desktop) so each copy gets the right className, the same
   * two-instances-toggled-by-CSS pattern PageHeader already uses for
   * actions/mobileActions. A single shared instance can't do this: it
   * would have to pick one fixed width for both breakpoints. */
  renderSearch: (className: string) => React.ReactNode;
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
  className,
}: ListFilterBarProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {renderSearch("md:hidden")}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {filters}
        {renderSearch("hidden w-64 shrink-0 md:block")}
      </div>
    </div>
  );
}
