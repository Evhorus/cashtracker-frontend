"use client";
import { useMemo } from "react";
import { SearchX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories } from "@/providers/categories-provider";
import { resolveIcon } from "../lib/icon-registry";
import { CategoryCard } from "./category-card";
import { CategoriesTable } from "./categories-table";
import { CategoriesSearch } from "./categories-search";
import {
  CATEGORY_TYPE_FILTERS as TYPE_FILTERS,
  useCategoriesFilter,
} from "./categories-filter-context";

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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return categories.filter((category) => {
      if (term && !category.label.toLowerCase().includes(term)) return false;
      if (type === "default" && !category.isDefault) return false;
      if (type === "custom" && category.isDefault) return false;
      return true;
    });
  }, [categories, search, type]);

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
      <div className="space-y-3">
        {/* Desktop renders this same state's search box inline in the
            page header instead (see categories/page.tsx) - md:hidden
            here avoids showing it twice. */}
        <CategoriesSearch className="md:hidden" />

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
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "categoría" : "categorías"}
        {" · "}
        {totalEnvelopesCategorized} sobres clasificados
      </p>

      {filtered.length === 0 ? (
        <Card className="animate-fade-in border-0 bg-card/50 p-12 text-center shadow-sm">
          <div className="mx-auto max-w-md space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <SearchX className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">
              {search
                ? `Sin resultados para "${search}"`
                : `Sin categorías en "${
                    TYPE_FILTERS.find((filter) => filter.value === type)?.label ?? type
                  }"`}
            </h3>
            <p className="text-muted-foreground">
              {search ? "Prueba con otro nombre." : "Prueba con otro filtro."}
            </p>
          </div>
        </Card>
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
          <CategoriesTable categories={filtered} categoryCounts={categoryCounts} />
        </>
      )}
    </div>
  );
}
