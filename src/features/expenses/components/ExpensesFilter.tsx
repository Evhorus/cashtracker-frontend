"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ArrowDownAZ, ArrowUpAZ, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export const ExpensesFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Initial state from URL
  const initialSort = searchParams.get("sort") || "ASC";
  const initialSearch = searchParams.get("search") || "";

  const [sort, setSort] = useState(initialSort);
  const [search, setSearch] = useState(initialSearch);

  const applyFilters = (newSort: string, newSearch: string) => {
    const params = new URLSearchParams(searchParams);

    // Sort Logic
    if (newSort) {
      params.set("sort", newSort);
    } else {
      params.delete("sort");
    }

    // Search Logic
    if (newSearch) {
      params.set("search", newSearch);
    } else {
      params.delete("search");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    applyFilters(newSort, search);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    // Simple debounce for search
    const timeoutId = setTimeout(() => {
      applyFilters(sort, value);
    }, 500);

    return () => clearTimeout(timeoutId);
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
            <Button variant="outline" className="w-[180px] justify-start">
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
