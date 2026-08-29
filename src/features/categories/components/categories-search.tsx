"use client";

import { useTranslations } from "next-intl";
import { SearchInput } from "@/components/common/search-input";
import { useCategoriesFilter } from "./categories-filter-context";

// Plain local-state search, unlike envelopes-filter.tsx's debounced URL
// param - the full category list already lives on the client
// (useCategories()), no backend round-trip to debounce against.
export function CategoriesSearch({ className }: { className?: string }) {
  const t = useTranslations("categories");
  const { search, setSearch } = useCategoriesFilter();

  return (
    <SearchInput
      value={search}
      onChange={setSearch}
      placeholder={t("searchPlaceholder")}
      aria-label={t("searchAria")}
      className={className}
    />
  );
}
