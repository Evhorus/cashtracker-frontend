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
import {
  formatCalendarDateForApi,
  formatMonthKey,
  getToday,
  parseCalendarDate,
} from "@/lib/date-helpers";
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
  /** Whatever range is currently active - from a prior period pick or
   * from DateRangeFilter's own calendar - used as the anchor when
   * switching period type, so "Semestre" after a manual Jul 2025 range
   * lands on the semester containing that start, not today's. Their
   * years are also folded into the instance lists below (see
   * `effectiveYears`). */
  startDate?: string;
  endDate?: string;
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
  startDate,
  endDate,
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

  // `years` (summary.availableYears) is the account's envelopes' own
  // *creation* years, not the years its expenses actually fall in - a
  // backdated expense (e.g. logged in June 2025 under an envelope
  // created in 2026) has no year of its own in that list. The raw
  // calendar (DateRangeFilter) lets you pick any date regardless; these
  // shortcuts should be just as unrestricted, so whatever range is
  // already active always gets its own year(s) folded in too.
  const effectiveYears = Array.from(
    new Set([
      ...years,
      ...[startDate, endDate]
        .filter((d): d is string => Boolean(d))
        .map((d) => parseCalendarDate(d).getUTCFullYear()),
    ]),
  );

  const instances =
    selectedType !== ALL_VALUE && selectedType !== YEAR_VALUE
      ? getPeriodInstances(selectedType, effectiveYears)
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

    if (value !== ALL_VALUE) {
      // Anchor the new type on whatever period is already active - a
      // prior period pick, or a manual DateRangeFilter range - so
      // switching from "1 jul 2025 – 30 jun 2026" to "Semestre" lands
      // on the semester containing that range's *start*, not today's.
      // Only once nothing at all is active does "today" take over.
      const anchor = resolveAnchorDate(startDate, selectedYear);

      if (value === YEAR_VALUE) {
        const anchorYear = parseCalendarDate(anchor).getUTCFullYear();
        const targetYear = effectiveYears.includes(anchorYear)
          ? anchorYear
          : effectiveYears.length > 0
            ? Math.max(...effectiveYears)
            : undefined;
        if (targetYear) params.set("year", String(targetYear));
      } else {
        const candidates = getPeriodInstances(value as PeriodType, effectiveYears);
        const defaultInstance =
          candidates.find(
            (i) => i.startDate <= anchor && anchor <= i.endDate,
          ) ?? candidates[candidates.length - 1];
        if (defaultInstance) {
          params.set("period", value);
          params.set("periodValue", defaultInstance.value);
          params.set("startDate", defaultInstance.startDate);
          params.set("endDate", defaultInstance.endDate);
        }
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
          {effectiveYears.length > 0 && (
            <SelectItem value={YEAR_VALUE}>{t("periodType.year")}</SelectItem>
          )}
          {effectiveYears.length > 0 &&
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
            {[...effectiveYears]
              .sort((a, b) => a - b)
              .map((year) => (
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

/** "yyyy-MM-dd" to build a new period type's default instance around:
 * the currently active range's start, then the active year's Jan 1,
 * then - only when nothing at all is active yet - today. */
function resolveAnchorDate(startDate?: string, selectedYear?: number): string {
  if (startDate) return startDate;
  if (selectedYear) return `${selectedYear}-01-01`;
  return formatCalendarDateForApi(getToday());
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
