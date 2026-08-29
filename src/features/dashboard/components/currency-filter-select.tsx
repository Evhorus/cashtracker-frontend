"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type CurrencyCode } from "@/lib/format-currency";

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
  const t = useTranslations("statistics");
  const tCurrency = useTranslations("currencies");
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
      <SelectTrigger
        size="sm"
        className="w-auto gap-1.5 font-medium"
        aria-label={t("filterCurrency")}
      >
        {/* Currency code only (COP, not "Peso Colombiano") - this is a
            compact filter chip, not the place a full currency name earns
            its space; the code is also what every amount in the app is
            already tagged with elsewhere (envelope cards, the detail
            page), so it stays the one consistent way currency shows up. */}
        <SelectValue>{(value: string) => value}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem key={currency} value={currency}>
            {tCurrency(currency)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
