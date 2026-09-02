"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DATE_FNS_LOCALES,
  formatCalendarDateForApi,
  formatCalendarDateShort,
  parseCalendarDate,
} from "@/lib/date-helpers";
import type { SupportedLocale } from "@/i18n/config";

interface DateRangeFilterProps {
  startDate?: string;
  endDate?: string;
}

// An exact date range, alternative to YearFilterSelect's whole-year
// shortcut - picking one clears the other (see handleApply/
// YearFilterSelect.handleChange), so the two never disagree about
// which period is active.
//
// Needs an explicit "Aplicar" rather than closing on the first
// complete-looking selection: react-day-picker's range mode reports a
// *complete* {from, to} pair (both ends equal to the same day) after
// the very first click, then keeps reporting a complete pair as the
// second click extends it - there's no "still picking" signal to tell
// a real range apart from a same-day one just clicked once. Committing
// to the URL on every onSelect call would apply and close the popover
// right after that first click, before the user can pick the actual
// end date.
export const DateRangeFilter = ({
  startDate,
  endDate,
}: DateRangeFilterProps) => {
  const t = useTranslations("statistics");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const appliedRange: DateRange | undefined =
    startDate && endDate
      ? { from: parseCalendarDate(startDate), to: parseCalendarDate(endDate) }
      : undefined;

  // The in-progress selection while the popover is open - only written
  // to the URL on "Aplicar".
  const [draftRange, setDraftRange] = useState(appliedRange);

  // Reset the draft from the applied range right as the popover opens
  // (not in an effect - there's no external system to synchronize
  // with, just an event to react to), so a cancelled edit never leaks
  // into the next open.
  const handleOpenChange = (next: boolean) => {
    if (next) setDraftRange(appliedRange);
    setOpen(next);
  };

  const navigate = (params: URLSearchParams) => {
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleApply = () => {
    if (!draftRange?.from || !draftRange?.to) return;
    const params = new URLSearchParams(searchParams);
    params.delete("year");
    params.set("startDate", formatCalendarDateForApi(draftRange.from));
    params.set("endDate", formatCalendarDateForApi(draftRange.to));
    navigate(params);
    setOpen(false);
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("startDate");
    params.delete("endDate");
    navigate(params);
    setOpen(false);
  };

  const label = appliedRange
    ? `${formatCalendarDateShort(appliedRange.from!, locale)} – ${formatCalendarDateShort(appliedRange.to!, locale)}`
    : t("dateRangePlaceholder");

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 font-medium"
              aria-label={t("filterDateRange")}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              {label}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={draftRange}
            defaultMonth={draftRange?.from}
            onSelect={setDraftRange}
            numberOfMonths={2}
            locale={DATE_FNS_LOCALES[locale]}
            captionLayout="dropdown"
          />
          <div className="flex items-center justify-end gap-2 border-t border-border/60 p-3">
            <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
              {t("clearDateRange")}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!draftRange?.from || !draftRange?.to}
              onClick={handleApply}
            >
              {t("applyDateRange")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {appliedRange && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleClear}
          aria-label={t("clearDateRange")}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};
