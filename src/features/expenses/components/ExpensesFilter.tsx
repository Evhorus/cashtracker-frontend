"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownAZ, ArrowUpAZ, Search } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export const ExpensesFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const searchTimeout = useRef<number | null>(null);

  const sort = searchParams.get("sort") || "ASC";
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

  const applyFilters = (newSort: string, newSearch: string) => {
    const params = new URLSearchParams(searchParams);

    if (newSort) {
      params.set("sort", newSort);
    } else {
      params.delete("sort");
    }

    if (newSearch) {
      params.set("search", newSearch);
    } else {
      params.delete("search");
    }

    startTransition(() => {
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`);
    });
  };

  const handleSortChange = (newSort: string) => {
    applyFilters(newSort, search);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    clearSearchTimeout();

    searchTimeout.current = window.setTimeout(() => {
      applyFilters(sort, value);
      searchTimeout.current = null;
    }, 500);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            className="pl-8"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-45 justify-start">
              {sort === "ASC" ? (
                <>
                  <ArrowUpAZ className="mr-2 h-4 w-4" />
                  Fecha Ascendente
                </>
              ) : (
                <>
                  <ArrowDownAZ className="mr-2 h-4 w-4" />
                  Fecha Descendente
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSortChange("ASC")}>
              <ArrowUpAZ className="mr-2 h-4 w-4" />
              Fecha Ascendente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("DESC")}>
              <ArrowDownAZ className="mr-2 h-4 w-4" />
              Fecha Descendente
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
