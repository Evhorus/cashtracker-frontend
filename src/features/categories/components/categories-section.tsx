"use client";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListFilterBar } from "@/components/common/list-filter-bar";
import { useCategories } from "@/providers/categories-provider";
import { resolveIcon } from "../lib/icon-registry";
import { CategoryCard } from "./category-card";
import { CategoriesTable } from "./categories-table";
import { CategoriesSearch } from "./categories-search";
import {
  CATEGORY_TYPE_FILTERS as TYPE_FILTERS,
  useCategoriesFilter,
} from "./categories-filter-context";
import { Text } from "@/components/common/typography";

interface CategoriesSectionProps {
  /** Per-category envelope count, keyed by CategoryDef.id - computed in
   * dashboard/categories/page.tsx from the real envelope list, not
   * estimated. Missing keys just mean 0. */
  categoryCounts: Record<string, number>;
}

// Same standard as EnvelopesGrid/EnvelopesFilter: a search box + status
// tabs, a count line, then a mobile card list + desktop table. Search/
// type filtering reads CategoriesFilterProvider's context (search state
// lives there, not here, so the search box itself can render inline in
// the page header on desktop - see categories/page.tsx) rather than
// EnvelopesFilter's debounced URL-param round-trip - the full category
// list already lives on the client (useCategories()), no backend call
// needed to filter it, so instant is both simpler and better UX here.
export function CategoriesSection({ categoryCounts }: CategoriesSectionProps) {
  const categories = useCategories();
  const { search, type, setType } = useCategoriesFilter();

  // No useMemo: the React Compiler (reactCompiler: true in
  // next.config.ts) memoizes this on the same three dependencies.
  const term = search.trim().toLowerCase();
  const filtered = categories.filter((category) => {
    if (term && !category.label.toLowerCase().includes(term)) return false;
    if (type === "default" && !category.isDefault) return false;
    if (type === "custom" && category.isDefault) return false;
    return true;
  });

  // Scoped to the current search/type filter - matches EnvelopesGrid's
  // meta.total, which is always "however many match what's on screen
  // right now", not a static grand total that stops making sense once
  // you've filtered the list down (found while testing: searching down
  // to 1 category still showed the full unfiltered "15 sobres").
  const totalEnvelopesCategorized = filtered.reduce(
    (sum, category) => sum + (categoryCounts[category.id] ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Kept out of the page header (see categories/page.tsx) so the
          search box isn't isolated top-right, far from both the title
          and the table it filters, on a wide viewport - see
          ListFilterBar. */}
      <ListFilterBar
        filters={
          <Tabs
            value={type}
            onValueChange={(value) =>
              setType(value as (typeof TYPE_FILTERS)[number]["value"])
            }
          >
            <TabsList className="w-full sm:w-fit">
              {TYPE_FILTERS.map((filter) => (
                <TabsTrigger key={filter.value} value={filter.value}>
                  {filter.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
        renderSearch={(className) => <CategoriesSearch className={className} />}
      />

      <Text>
        {filtered.length} {filtered.length === 1 ? "categoría" : "categorías"}
        {" · "}
        {totalEnvelopesCategorized} sobres clasificados
      </Text>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={
            search
              ? `Sin resultados para "${search}"`
              : `Sin categorías en "${
                  TYPE_FILTERS.find((filter) => filter.value === type)?.label ??
                  type
                }"`
          }
          description={
            search ? "Prueba con otro nombre." : "Prueba con otro filtro."
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filtered.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                count={categoryCounts[category.id] ?? 0}
                Icon={resolveIcon(category.icon)}
              />
            ))}
          </div>
          <CategoriesTable
            categories={filtered}
            categoryCounts={categoryCounts}
          />
        </>
      )}
    </div>
  );
}
