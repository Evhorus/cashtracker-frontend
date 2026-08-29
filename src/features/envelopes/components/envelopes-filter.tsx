"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { SearchInput } from "@/components/common/search-input";
import { useDebouncedSearchParam } from "@/hooks/use-debounced-search-param";
import { ListFilterBar } from "@/components/common/list-filter-bar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ENVELOPE_STATUS_TAB_VALUES,
  type EnvelopeStatusTab,
} from "@/features/envelopes/lib/envelope-helpers";

/**
 * The word for a tab. Every tab but "all" IS a status, so it reads the
 * status's own message - the same one the row badge renders. That is
 * what keeps the tab bar and the table from drifting into two
 * vocabularies, which is exactly what happened while the tabs had their
 * own `filters.*` labels.
 */
export function statusFilterLabel(
  t: ReturnType<typeof useTranslations<"envelopes">>,
  filter: EnvelopeStatusTab,
): string {
  return filter === "all" ? t("filters.all") : t(`status.${filter}`);
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

const EnvelopesStatusTabs = () => {
  const t = useTranslations("envelopes");
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

  const handleStatusChange = (value: unknown) => {
    const params = new URLSearchParams(searchParams);

    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value as string);
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
    <Tabs value={status} onValueChange={handleStatusChange}>
      {/* w-max, not w-full: the row is as wide as its tabs and
            scrolls within ListFilterBar rather than stretching or
            clipping them. */}
      <TabsList className="w-max">
        {ENVELOPE_STATUS_TAB_VALUES.map((filter) => (
          <TabsTrigger key={filter} value={filter}>
            {statusFilterLabel(t, filter)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

// Search full-width above the status tabs on mobile; the two sharing
// one row on desktop, right above the table they filter - see
// ListFilterBar for why this is a shared shell, not bespoke markup.
export const EnvelopesFilter = () => {
  return (
    <ListFilterBar
      filters={<EnvelopesStatusTabs />}
      renderSearch={(className) => <EnvelopesSearch className={className} />}
    />
  );
};
