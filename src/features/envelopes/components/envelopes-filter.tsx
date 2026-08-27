"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SearchInput } from "@/components/common/search-input";
import { ListFilterBar } from "@/components/common/list-filter-bar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ENVELOPE_STATUS_FILTERS,
  type EnvelopeStatusFilter,
} from "@/features/envelopes/lib/envelope-helpers";

// Debounced URL-param search - envelopes are filtered server-side (a
// paginated backend call), unlike categories/categories-search.tsx,
// whose full list already lives on the client.
const EnvelopesSearch = ({ className }: { className?: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const searchTimeout = useRef<number | null>(null);

  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);

  const clearSearchTimeout = () => {
    if (searchTimeout.current) {
      window.clearTimeout(searchTimeout.current);
      searchTimeout.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearSearchTimeout();
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearch(value);

    clearSearchTimeout();

    searchTimeout.current = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }

      // A new search can shrink the result set - start back at page 1
      // instead of leaving the user stuck on a now out-of-range page.
      params.delete("page");

      startTransition(() => {
        const query = params.toString();
        router.replace(`${pathname}${query ? `?${query}` : ""}`);
      });

      searchTimeout.current = null;
    }, 500);
  };

  return (
    <SearchInput
      value={search}
      onChange={handleSearchChange}
      placeholder="Buscar por nombre o categoría..."
      aria-label="Buscar sobres por nombre o categoría"
      className={className}
    />
  );
};

const EnvelopesStatusTabs = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const statusParam = searchParams.get("status");
  const status: EnvelopeStatusFilter = ENVELOPE_STATUS_FILTERS.some(
    (filter) => filter.value === statusParam,
  )
    ? (statusParam as EnvelopeStatusFilter)
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
      <TabsList className="w-full sm:w-fit">
        {ENVELOPE_STATUS_FILTERS.map((filter) => (
          <TabsTrigger key={filter.value} value={filter.value}>
            {filter.label}
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
