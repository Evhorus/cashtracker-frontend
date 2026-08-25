"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarArrowDown, CalendarArrowUp, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EXPENSES_DEFAULT_PAGE_SIZE,
  EXPENSES_PAGE_SIZE_OPTIONS,
} from "../lib/expense-helpers";

export const ExpensesFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const searchTimeout = useRef<number | null>(null);

  const sort = searchParams.get("sort") || "ASC";
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);

  const limitParam = Number(searchParams.get("limit"));
  const pageSize = EXPENSES_PAGE_SIZE_OPTIONS.some(
    (option) => option.value === limitParam,
  )
    ? limitParam
    : EXPENSES_DEFAULT_PAGE_SIZE;

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

    // Changing a filter can shrink the result set - start back at page 1
    // instead of leaving the user stuck on a now out-of-range page.
    params.delete("page");

    startTransition(() => {
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`);
    });
  };

  const handleSortChange = (newSort: string) => {
    applyFilters(newSort, search);
  };

  const handlePageSizeChange = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams);
    const newLimit = Number(value);

    if (newLimit === EXPENSES_DEFAULT_PAGE_SIZE) {
      params.delete("limit");
    } else {
      params.set("limit", value);
    }

    // Same reasoning as applyFilters - a bigger/smaller page can put the
    // current page out of range.
    params.delete("page");

    startTransition(() => {
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`);
    });
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
    <div className="mb-6 flex flex-col gap-4 md:flex-row">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            aria-label="Buscar gastos por nombre"
            className="pl-8"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Select
          value={String(pageSize)}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="w-28" aria-label="Gastos por página">
            <SelectValue>
              {(value: string) => {
                const option = EXPENSES_PAGE_SIZE_OPTIONS.find(
                  (o) => String(o.value) === value,
                );
                return option ? `${option.label} / pág.` : value;
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {EXPENSES_PAGE_SIZE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className="w-52 justify-start"
                aria-label="Ordenar gastos por fecha"
              >
                {sort === "ASC" ? (
                  <>
                    <CalendarArrowUp className="mr-2 h-4 w-4" />
                    Más antiguos primero
                  </>
                ) : (
                  <>
                    <CalendarArrowDown className="mr-2 h-4 w-4" />
                    Más recientes primero
                  </>
                )}
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSortChange("DESC")}>
              <CalendarArrowDown className="mr-2 h-4 w-4" />
              Más recientes primero
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("ASC")}>
              <CalendarArrowUp className="mr-2 h-4 w-4" />
              Más antiguos primero
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
