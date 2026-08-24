"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_YEARS_VALUE = "all";

interface YearFilterSelectProps {
  years: number[];
  selectedYear?: number;
}

// A row of pill buttons works for two or three years, but sprawls once
// there's real history - a select scales to any number of years while
// staying a single, predictable control.
export const YearFilterSelect = ({
  years,
  selectedYear,
}: YearFilterSelectProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string | null) {
    if (!value) return;
    // Preserves ?currency= (CurrencyFilterSelect) - the two filters are
    // independent, picking a year shouldn't reset which currency's
    // chart is showing.
    const params = new URLSearchParams(searchParams);
    if (value === ALL_YEARS_VALUE) {
      params.delete("year");
    } else {
      params.set("year", value);
    }
    const qs = params.toString();
    // Same route this control is actually rendered on (statistics/page.tsx
    // today) - a hardcoded "/dashboard" here used to send the user to a
    // different page instead of updating the chart in place.
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <Select
      value={selectedYear ? String(selectedYear) : ALL_YEARS_VALUE}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-40" aria-label="Filtrar por año">
        <SelectValue>
          {(value: string) =>
            value === ALL_YEARS_VALUE ? "Todos los años" : value
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_YEARS_VALUE}>Todos los años</SelectItem>
        {years.map((year) => (
          <SelectItem key={year} value={String(year)}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
