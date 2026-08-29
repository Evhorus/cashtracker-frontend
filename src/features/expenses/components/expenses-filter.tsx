"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarArrowDown, CalendarArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/common/search-input";
import { useDebouncedSearchParam } from "@/hooks/use-debounced-search-param";
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

  // Debounce/URL plumbing shared with the envelopes list - see
  // useDebouncedSearchParam. `applyTo` is what lets the sort and
  // page-size handlers below carry a half-typed search into their own
  // navigation instead of dropping it (or having the pending write land
  // afterwards and undo them).
  const {
    value: search,
    onChange: handleSearchChange,
    applyTo: applyPendingSearch,
  } = useDebouncedSearchParam();

  // Most recent first by default - matches the backend's own default
  // (expenses.repository.ts) now that it's DESC too, so the button
  // label is right even when the URL carries no ?sort= at all.
  const sort = searchParams.get("sort") || "DESC";

  const limitParam = Number(searchParams.get("limit"));
  const pageSize = EXPENSES_PAGE_SIZE_OPTIONS.some(
    (option) => option.value === limitParam,
  )
    ? limitParam
    : EXPENSES_DEFAULT_PAGE_SIZE;

  const navigate = (params: URLSearchParams) => {
    // Changing a filter can shrink the result set - start back at page 1
    // instead of leaving the user stranded on a now out-of-range page.
    params.delete("page");
    startTransition(() => {
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`);
    });
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    applyPendingSearch(params);
    params.set("sort", newSort);
    navigate(params);
  };

  const handlePageSizeChange = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams);
    applyPendingSearch(params);

    if (Number(value) === EXPENSES_DEFAULT_PAGE_SIZE) {
      params.delete("limit");
    } else {
      params.set("limit", value);
    }

    navigate(params);
  };

  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row">
      <SearchInput
        value={search}
        onChange={handleSearchChange}
        placeholder="Buscar por nombre..."
        aria-label="Buscar gastos por nombre"
        className="flex-1"
      />
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
