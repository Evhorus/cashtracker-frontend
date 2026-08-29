import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  /** Route to link to, e.g. "/dashboard/envelopes". */
  basePath: string;
  /**
   * Any other active query params (filters, sort, search) to carry over
   * when changing pages, so paginating doesn't reset them.
   */
  searchParams?: Record<string, string | undefined>;
}

function buildHref(
  basePath: string,
  page: number,
  extra?: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value);
    }
  }
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

/**
 * Windowed page range with ellipsis: always shows first, last, and the
 * pages immediately around the current one - the standard pattern used
 * by most paginated list UIs, instead of listing every page number.
 */
function getPageRange(current: number, total: number) {
  const range: (number | "ellipsis")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) range.push("ellipsis");
  for (let page = left; page <= right; page++) range.push(page);
  if (right < total - 1) range.push("ellipsis");
  if (total > 1) range.push(total);

  return range;
}

export const PaginationControls = ({
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  basePath,
  searchParams,
}: PaginationControlsProps) => {
  if (totalPages <= 1) return null;

  const pages = getPageRange(page, totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {/* `inert`, not tabIndex, to take a disabled arrow out of the
              tab order. pointer-events-none only stops the mouse, so
              these were still reachable with Tab and still activated
              with Enter, navigating to page 0 or past the last page.
              tabIndex was the obvious fix and the wrong one: Base UI's
              Button sets its own tabIndex when rendering as a non-native
              element (nativeButton={false} + render={<a/>}), and which
              value wins differs between the server render and hydration
              - a real "tree hydrated but some attributes ... didn't
              match" warning. `inert` is a plain DOM attribute Base UI
              doesn't manage, so there is nothing to conflict with, and
              it removes the element from the accessibility tree too -
              which is what a disabled control should be.
              Spanish text/labels because the shadcn primitive defaults
              to English ("Previous"/"Next", "Go to previous page") and
              components/ui is generated code we don't hand-edit. */}
          <PaginationPrevious
            href={buildHref(basePath, Math.max(1, page - 1), searchParams)}
            text="Anterior"
            aria-label="Ir a la página anterior"
            aria-disabled={!hasPreviousPage}
            inert={!hasPreviousPage}
            className={
              hasPreviousPage ? undefined : "pointer-events-none opacity-50"
            }
          />
        </PaginationItem>

        {pages.map((entry, index) =>
          entry === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <PaginationLink
                href={buildHref(basePath, entry, searchParams)}
                isActive={entry === page}
                aria-label={`Ir a la página ${entry}`}
              >
                {entry}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href={buildHref(
              basePath,
              Math.min(totalPages, page + 1),
              searchParams,
            )}
            text="Siguiente"
            aria-label="Ir a la página siguiente"
            aria-disabled={!hasNextPage}
            inert={!hasNextPage}
            className={
              hasNextPage ? undefined : "pointer-events-none opacity-50"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
