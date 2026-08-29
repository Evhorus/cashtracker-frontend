"use client";

import { useTranslations } from "next-intl";

import { FilterSelect } from "@/components/common/filter-select";
import {
  CATEGORY_TYPE_FILTERS,
  useCategoriesFilter,
} from "./categories-filter-context";

/**
 * The default/custom filter for the categories list.
 *
 * Its own component, and not inline in CategoriesSection, for the same
 * reason as the envelopes list's status filter: on desktop it renders in
 * the PageHeader beside the create button, and on mobile inside
 * ListFilterBar under the search. Two placements, one component.
 *
 * Reads context rather than the URL, unlike the envelopes filter - the
 * full category list is already in memory, so there is no server round
 * trip for a URL to survive.
 */
export function CategoriesTypeFilter() {
  const t = useTranslations("categories");
  const { type, setType } = useCategoriesFilter();

  return (
    <FilterSelect
      label={t("table.type")}
      value={type}
      onValueChange={(value) =>
        setType(value as (typeof CATEGORY_TYPE_FILTERS)[number])
      }
      className="w-full sm:w-auto"
      options={CATEGORY_TYPE_FILTERS.map((filter) => ({
        value: filter,
        label: t(`types.${filter}`),
      }))}
    />
  );
}
