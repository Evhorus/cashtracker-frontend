"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ENVELOPE_STATUS_FILTERS,
  type EnvelopeStatusFilter,
} from "@/features/envelopes/lib/envelope-helpers";

// Same debounced-search pattern as ExpensesFilter - no sort dropdown here,
// the backend has nothing to sort envelopes by (no date of their own).
export const EnvelopesFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const searchTimeout = useRef<number | null>(null);

  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);

  const statusParam = searchParams.get("status");
  const status: EnvelopeStatusFilter = ENVELOPE_STATUS_FILTERS.some(
    (filter) => filter.value === statusParam,
  )
    ? (statusParam as EnvelopeStatusFilter)
    : "all";

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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
    <div className="mb-6 space-y-3">
      <div className="relative">
        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o categoría..."
          aria-label="Buscar sobres por nombre o categoría"
          className="pl-8"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <Tabs value={status} onValueChange={handleStatusChange}>
        <TabsList className="w-full sm:w-fit">
          {ENVELOPE_STATUS_FILTERS.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};
