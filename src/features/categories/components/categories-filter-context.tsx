"use client";

import { createContext, useContext, useMemo, useState } from "react";

export const CATEGORY_TYPE_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "default", label: "Predeterminadas" },
  { value: "custom", label: "Personalizadas" },
] as const;

export type CategoryTypeFilter = (typeof CATEGORY_TYPE_FILTERS)[number]["value"];

interface CategoriesFilterContextValue {
  search: string;
  setSearch: (value: string) => void;
  type: CategoryTypeFilter;
  setType: (value: CategoryTypeFilter) => void;
}

const CategoriesFilterContext =
  createContext<CategoriesFilterContextValue | null>(null);

// Lets the search box live in the page header (desktop, inline next to
// "Nueva categoría" - matching how envelopes/page.tsx does it) while the
// filtered results render in CategoriesSection lower on the page - two
// siblings under the same server-rendered page.tsx that both need the
// same search/type state, hence a context instead of prop drilling
// through the server component in between them.
export function CategoriesFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<CategoryTypeFilter>("all");

  const value = useMemo(
    () => ({ search, setSearch, type, setType }),
    [search, type],
  );

  return (
    <CategoriesFilterContext.Provider value={value}>
      {children}
    </CategoriesFilterContext.Provider>
  );
}

export function useCategoriesFilter() {
  const ctx = useContext(CategoriesFilterContext);
  if (!ctx) {
    throw new Error(
      "useCategoriesFilter must be used within a CategoriesFilterProvider",
    );
  }
  return ctx;
}
