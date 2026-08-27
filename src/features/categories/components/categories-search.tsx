"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCategoriesFilter } from "./categories-filter-context";

export function CategoriesSearch({ className }: { className?: string }) {
  const { search, setSearch } = useCategoriesFilter();

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar categoría..."
        aria-label="Buscar categorías por nombre"
        className="pl-8"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
