"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCY_MAP, type CurrencyCode } from "@/lib/format-currency";

interface CurrencyFilterSelectProps {
  currencies: CurrencyCode[];
  selectedCurrency: CurrencyCode;
}

/**
 * Which currency the monthly chart below (MonthlySpendingChart) is
 * scoped to - only rendered when the account actually has envelopes in
 * more than one currency (dashboard/page.tsx), since a single-currency
 * account has nothing to pick between. Preserves the existing ?year=
 * filter when switching, same as YearFilterSelect preserves ?currency=
 * - the two filters are independent, picking one shouldn't reset the
 * other.
 */
export const CurrencyFilterSelect = ({
  currencies,
  selectedCurrency,
}: CurrencyFilterSelectProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams);
    params.set("currency", value);
    // Same route this control is actually rendered on (statistics/page.tsx
    // today) - a hardcoded "/dashboard" here used to send the user to a
    // different page instead of updating the chart in place.
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={selectedCurrency} onValueChange={handleChange}>
      <SelectTrigger className="w-40" aria-label="Filtrar por moneda">
        <SelectValue>
          {(value: string) =>
            CURRENCY_MAP[value as CurrencyCode]?.label ?? value
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem key={currency} value={currency}>
            {CURRENCY_MAP[currency]?.label ?? currency}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
