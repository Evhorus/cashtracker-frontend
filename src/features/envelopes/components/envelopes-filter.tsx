"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ENVELOPE_STATUS_FILTERS,
  type EnvelopeStatusFilter,
} from "@/features/envelopes/lib/envelope-helpers";

// Split out of what used to be one combined component so the search box
// can sit inline in the page header on desktop (next to "Nuevo Sobre",
// matching the mockup's compact header row) while still stacking full-
// width above the status tabs on mobile - same two-instances-toggled-by-
// CSS pattern envelopes/page.tsx already uses for CreateEnvelopeDialog
// (actions vs. mobileActions).
export const EnvelopesSearch = ({ className }: { className?: string }) => {
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

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar por nombre o categoría..."
        aria-label="Buscar sobres por nombre o categoría"
        className="pl-8"
        value={search}
        onChange={handleSearchChange}
      />
    </div>
  );
};

export const EnvelopesStatusTabs = ({ className }: { className?: string }) => {
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
    <Tabs value={status} onValueChange={handleStatusChange} className={className}>
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

// Mobile-only combined block (search full-width, tabs below) - desktop
// renders EnvelopesSearch inline in the page header instead (see
// envelopes/page.tsx) and just this component's tabs half.
export const EnvelopesFilter = () => {
  return (
    <div className="space-y-3">
      <EnvelopesSearch className="md:hidden" />
      <EnvelopesStatusTabs />
    </div>
  );
};
