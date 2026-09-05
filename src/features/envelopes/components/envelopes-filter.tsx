"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { SearchInput } from "@/components/common/search-input";
import { useDebouncedSearchParam } from "@/hooks/use-debounced-search-param";
import { ListFilterBar } from "@/components/common/list-filter-bar";
import { FilterSelect } from "@/components/common/filter-select";
import {
  ENVELOPE_STATUS_TAB_VALUES,
  ENVELOPES_DEFAULT_PAGE_SIZE,
  ENVELOPES_MAX_PAGE_SIZE,
  ENVELOPES_PAGE_SIZE_OPTIONS,
  type EnvelopeStatusTab,
} from "@/features/envelopes/lib/envelope-helpers";

/**
 * The word for a tab. A status tab reads the status's own message - the
 * same one the row badge renders - so the tab bar and the table cannot
 * drift into two vocabularies, which is what happened while every tab
 * had its own `filters.*` label.
 *
 * "all" and "alert" are the exceptions because they are not statuses:
 * they keep their own words under `filters.*`.
 */
export function statusFilterLabel(
  t: ReturnType<typeof useTranslations<"envelopes">>,
  filter: EnvelopeStatusTab,
): string {
  if (filter === "all") return t("filters.all");
  if (filter === "alert") return t("filters.alert");
  return t(`status.${filter}`);
}

// Debounced URL-param search - envelopes are filtered server-side (a
// paginated backend call), unlike categories/categories-search.tsx,
// whose full list already lives on the client. The debounce/URL
// plumbing itself lives in useDebouncedSearchParam, shared with the
// expenses list.
const EnvelopesSearch = ({ className }: { className?: string }) => {
  const t = useTranslations("envelopes");
  const { value, onChange } = useDebouncedSearchParam();

  return (
    <SearchInput
      value={value}
      onChange={onChange}
      placeholder={t("searchPlaceholder")}
      aria-label={t("searchAria")}
      className={className}
    />
  );
};

export const EnvelopesStatusFilter = () => {
  const t = useTranslations("envelopes");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const statusParam = searchParams.get("status");
  const status: EnvelopeStatusTab = ENVELOPE_STATUS_TAB_VALUES.some(
    (filter) => filter === statusParam,
  )
    ? (statusParam as EnvelopeStatusTab)
    : "all";

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }

    // Same reasoning as the search handler above - a narrower filter can
    // shrink the result set below the current page.
    params.delete("page");

    startTransition(() => {
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`);
    });
  };

  return (
    <FilterSelect
      label={tCommon("status")}
      value={status}
      onValueChange={handleStatusChange}
      className="w-full sm:w-auto"
      options={ENVELOPE_STATUS_TAB_VALUES.map((filter) => ({
        value: filter,
        label: statusFilterLabel(t, filter),
        // The union sits below a divider - it is a saved view, not one
        // more state, and the line says so without a word.
        separatorBefore: filter === "alert",
      }))}
    />
  );
};

// The largest option means "everything" rather than a literal count, so
// it reads as a word; the other two are just their number. Mirrors
// ExpensesFilter's pageSizeLabel.
const pageSizeLabel = (
  t: ReturnType<typeof useTranslations<"envelopes">>,
  size: number,
) => (size === ENVELOPES_MAX_PAGE_SIZE ? t("pageSizeAll") : String(size));

export const EnvelopesPageSizeFilter = () => {
  const t = useTranslations("envelopes");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const limitParam = Number(searchParams.get("limit"));
  const pageSize = ENVELOPES_PAGE_SIZE_OPTIONS.some(
    (option) => option === limitParam,
  )
    ? limitParam
    : ENVELOPES_DEFAULT_PAGE_SIZE;

  const handlePageSizeChange = (value: string) => {
    const params = new URLSearchParams(searchParams);

    if (Number(value) === ENVELOPES_DEFAULT_PAGE_SIZE) {
      params.delete("limit");
    } else {
      params.set("limit", value);
    }

    // Same reasoning as the status handler above - a bigger page can
    // land past the last one the previous page size had.
    params.delete("page");

    startTransition(() => {
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`);
    });
  };

  return (
    <FilterSelect
      label={t("perPage")}
      value={String(pageSize)}
      onValueChange={handlePageSizeChange}
      className="w-full sm:w-auto"
      options={ENVELOPES_PAGE_SIZE_OPTIONS.map((option) => ({
        value: String(option),
        label: pageSizeLabel(t, option),
      }))}
    />
  );
};

// Search full-width above the status tabs on mobile; the two sharing
// one row on desktop, right above the table they filter - see
// ListFilterBar for why this is a shared shell, not bespoke markup.
export const EnvelopesFilter = ({
  actions,
}: {
  /** Right-aligned on the same row, desktop only - see ListFilterBar. */
  actions?: React.ReactNode;
}) => {
  return (
    <ListFilterBar
      actions={actions}
      filters={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <EnvelopesStatusFilter />
          <EnvelopesPageSizeFilter />
        </div>
      }
      renderSearch={(className) => <EnvelopesSearch className={className} />}
    />
  );
};
