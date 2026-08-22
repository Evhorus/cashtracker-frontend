"use client";

import { useRouter } from "next/navigation";
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

  return (
    <Select
      value={selectedYear ? String(selectedYear) : ALL_YEARS_VALUE}
      onValueChange={(value) => {
        router.push(
          value === ALL_YEARS_VALUE ? "/dashboard" : `/dashboard?year=${value}`,
        );
      }}
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
