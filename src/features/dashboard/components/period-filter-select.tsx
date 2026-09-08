"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCalendarDateForApi, formatMonthKey, getToday } from "@/lib/date-helpers";
import {
  getPeriodInstances,
  type PeriodInstance,
  type PeriodType,
} from "@/features/dashboard/lib/period-ranges";
import type { SupportedLocale } from "@/i18n/config";

const ALL_VALUE = "all";
const YEAR_VALUE = "year";
type SelectedType = typeof ALL_VALUE | typeof YEAR_VALUE | PeriodType;

const PERIOD_TYPES: PeriodType[] = ["semester", "fourMonth", "quarter", "month"];

interface PeriodFilterSelectProps {
  years: number[];
  selectedYear?: number;
  /** Only set when the active filter came from this control's own
   * month/quarter/fourMonth/semester picker - lets it re-select the
   * right instance after a reload without page.tsx (which only ever
   * deals in year/startDate/endDate) knowing period types exist. */
  period?: string;
  periodValue?: string;
}

// Replaces the plain year-only YearFilterSelect: a "period type" select
// (Todo/Año/Semestre/Cuatrimestre/Trimestre/Mes) plus, for every type
// but "Todo", a second select listing that type's actual instances
// across the account's years. Picking one computes an exact date range
// and writes it to the same startDate/endDate (or year) query params
// DateRangeFilter already uses, so the rest of the page - and the
// backend - see nothing new.
export const PeriodFilterSelect = ({
  years,
  selectedYear,
  period,
  periodValue,
}: PeriodFilterSelectProps) => {
  const t = useTranslations("statistics");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedType: SelectedType =
    period && isPeriodType(period)
      ? period
      : selectedYear
        ? YEAR_VALUE
        : ALL_VALUE;

  const instances =
    selectedType !== ALL_VALUE && selectedType !== YEAR_VALUE
      ? getPeriodInstances(selectedType, years)
      : [];

  const navigate = (params: URLSearchParams) => {
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  // Preserves ?currency= - the filters are independent, changing one
  // shouldn't reset which currency's chart is showing.
  function handleTypeChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams);
    params.delete("year");
    params.delete("startDate");
    params.delete("endDate");
    params.delete("period");
    params.delete("periodValue");

    if (value === YEAR_VALUE) {
      // No instance picked yet - default to the most recent year so
      // switching to "Año" always lands on something applied, the same
      // way opening the old YearFilterSelect never left it blank.
      const [mostRecentYear] = [...years].sort((a, b) => b - a);
      if (mostRecentYear) params.set("year", String(mostRecentYear));
    } else if (value !== ALL_VALUE) {
      const candidates = getPeriodInstances(value as PeriodType, years);
      // Default to the period that contains today, not just the newest
      // one on the list - "Trimestre" in October should land on Q4
      // (has this quarter's spending), not silently jump to Q1 next
      // year just because it sorts first.
      const todayStr = formatCalendarDateForApi(getToday());
      const defaultInstance =
        candidates.find(
          (i) => i.startDate <= todayStr && todayStr <= i.endDate,
        ) ?? candidates[0];
      if (defaultInstance) {
        params.set("period", value);
        params.set("periodValue", defaultInstance.value);
        params.set("startDate", defaultInstance.startDate);
        params.set("endDate", defaultInstance.endDate);
      }
    }
    navigate(params);
  }

  function handleInstanceChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams);
    if (selectedType === YEAR_VALUE) {
      params.set("year", value);
      params.delete("startDate");
      params.delete("endDate");
    } else if (selectedType !== ALL_VALUE) {
      const instance = instances.find((i) => i.value === value);
      if (!instance) return;
      params.set("period", selectedType);
      params.set("periodValue", instance.value);
      params.set("startDate", instance.startDate);
      params.set("endDate", instance.endDate);
      params.delete("year");
    }
    navigate(params);
  }

  const instanceValue =
    selectedType === YEAR_VALUE ? String(selectedYear ?? "") : (periodValue ?? "");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={selectedType} onValueChange={handleTypeChange}>
        <SelectTrigger
          size="sm"
          className="w-auto gap-1.5 font-medium"
          aria-label={t("filterPeriodType")}
        >
          <SelectValue>{() => t(`periodType.${selectedType}`)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>{t("periodType.all")}</SelectItem>
          {years.length > 0 && (
            <SelectItem value={YEAR_VALUE}>{t("periodType.year")}</SelectItem>
          )}
          {years.length > 0 &&
            PERIOD_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`periodType.${type}`)}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {selectedType === YEAR_VALUE && (
        <Select value={instanceValue} onValueChange={handleInstanceChange}>
          <SelectTrigger
            size="sm"
            className="w-auto gap-1.5 font-medium"
            aria-label={t("filterPeriodInstance")}
          >
            <SelectValue>{(value: string) => value}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {selectedType !== ALL_VALUE && selectedType !== YEAR_VALUE && (
        <Select value={instanceValue} onValueChange={handleInstanceChange}>
          <SelectTrigger
            size="sm"
            className="w-auto gap-1.5 font-medium"
            aria-label={t("filterPeriodInstance")}
          >
            <SelectValue>
              {() => instanceLabel(instances, instanceValue, locale)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {instances.map((instance) => (
              <SelectItem key={instance.value} value={instance.value}>
                {instanceLabel(instances, instance.value, locale)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

function isPeriodType(value: string): value is PeriodType {
  return (PERIOD_TYPES as string[]).includes(value);
}

/** "ago 2026" for a single-month instance, "ene – mar 2026" for a
 * multi-month one - reuses the same month-key formatter the monthly
 * chart's axis labels already use, instead of inventing a new date
 * format just for this list. */
function instanceLabel(
  instances: PeriodInstance[],
  value: string,
  locale: SupportedLocale,
): string {
  const instance = instances.find((i) => i.value === value);
  if (!instance) return "";
  if (instance.startMonthKey === instance.endMonthKey) {
    return formatMonthKey(instance.startMonthKey, locale, true);
  }
  return `${formatMonthKey(instance.startMonthKey, locale, false)} – ${formatMonthKey(instance.endMonthKey, locale, true)}`;
}
