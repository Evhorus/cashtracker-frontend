"use client";

import { createContext, useContext, useState } from "react";

/** Tab order. Values only - the words are `categories.types.*`. */
export const CATEGORY_TYPE_FILTERS = ["all", "default", "custom"] as const;

export type CategoryTypeFilter = (typeof CATEGORY_TYPE_FILTERS)[number];

interface CategoriesFilterContextValue {
  search: string;
  setSearch: (value: string) => void;
  type: CategoryTypeFilter;
  setType: (value: CategoryTypeFilter) => void;
}

const CategoriesFilterContext =
  createContext<CategoriesFilterContextValue | null>(null);

// Lets the search box live in the page header (desktop, inline next to
// the "new category" button - matching how envelopes/page.tsx does it)
// while the
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

  // No useMemo: the React Compiler (reactCompiler: true in
  // next.config.ts) memoizes this object on the same dependencies it
  // would have been given by hand.
  return (
    <CategoriesFilterContext.Provider
      value={{ search, setSearch, type, setType }}
    >
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
