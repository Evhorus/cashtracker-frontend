"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  formatCalendarDateForApi,
  formatMonthKey,
  getToday,
  parseCalendarDate,
} from "@/shared/utils/date-helpers";
import {
  filterInstancesInRange,
  getPeriodInstances,
  typeFitsWithinRange,
  yearFitsWithinRange,
  type PeriodInstance,
  type PeriodType,
} from "@/features/dashboard/lib/period-ranges";
import type { SupportedLocale } from "@/shared/config/i18n/config";

const ALL_VALUE = "all";
const YEAR_VALUE = "year";
type SelectedType = typeof ALL_VALUE | typeof YEAR_VALUE | PeriodType;

const PERIOD_TYPES: PeriodType[] = [
  "semester",
  "fourMonth",
  "quarter",
  "month",
];

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
   * lands on the semester containing that start, not today's. */
  startDate?: string;
  endDate?: string;
  /** The boundary the user last drew by hand in DateRangeFilter's own
   * calendar - set (and only ever set) by that component, alongside
   * startDate/endDate but never overwritten by this one. Unlike
   * startDate/endDate, which this control freely rewrites to whichever
   * month/quarter/etc. is currently selected, these stay put across
   * every period-type switch, so "solo lo que marqué" (see
   * `clipToMarkedRange`) keeps holding no matter how many times you
   * change type after drawing a range - not just on the first switch. */
  markedStart?: string;
  markedEnd?: string;
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
  markedStart,
  markedEnd,
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
  // shortcuts should be just as unrestricted, so a marked range's own
  // year(s) - or, absent one, whatever's currently active - are always
  // folded in too.
  const effectiveYears = Array.from(
    new Set([
      ...years,
      ...[markedStart, markedEnd, startDate, endDate]
        .filter((d): d is string => Boolean(d))
        .map((d) => parseCalendarDate(d).getUTCFullYear()),
    ]),
  );

  // Both call sites want the same "this type's instances, clipped to
  // whatever's marked" - one for the currently selected type, one for
  // handleTypeChange to default into a *new* type before it's applied.
  const getInstancesForType = (type: PeriodType) =>
    clipToMarkedRange(
      getPeriodInstances(type, effectiveYears),
      markedStart,
      markedEnd,
    );

  const instances =
    selectedType !== ALL_VALUE && selectedType !== YEAR_VALUE
      ? getInstancesForType(selectedType)
      : [];

  // A type only earns a spot in the dropdown if at least one of its
  // instances actually fits inside the marked range - offering
  // "Trimestre" for a 2-month mark would only ever apply something
  // wider than what was drawn, which is the opposite of narrowing down.
  // No marked range yet (a still-valid year/period link) skips the
  // check entirely - nothing to be too big *for*. The currently
  // selected type always renders regardless, so a stale URL can't leave
  // the Select pointing at an option that isn't there.
  const typeFits = (type: PeriodType) =>
    !markedStart ||
    !markedEnd ||
    type === selectedType ||
    typeFitsWithinRange(type, effectiveYears, markedStart, markedEnd);
  const availableTypes = PERIOD_TYPES.filter(typeFits);

  const yearFits = (year: number) =>
    !markedStart ||
    !markedEnd ||
    year === selectedYear ||
    yearFitsWithinRange(year, markedStart, markedEnd);
  const yearOptionAvailable =
    effectiveYears.length > 0 && effectiveYears.some(yearFits);

  const navigate = (params: URLSearchParams) => {
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  // Preserves ?currency= (and markedStart/markedEnd, by never touching
  // them) - the filters are independent, changing one shouldn't reset
  // the other. No ALL_VALUE branch here - there's no rendered item for
  // it (see SelectContent above), so onValueChange never receives it.
  function handleTypeChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams);
    params.delete("year");
    params.delete("startDate");
    params.delete("endDate");
    params.delete("period");
    params.delete("periodValue");

    // Anchor the new type on whatever period is already active - a
    // prior period pick, or a manual DateRangeFilter range - so
    // switching from "1 jul 2025 – 30 jun 2026" to "Semestre" lands on
    // the semester containing that range's *start*, not today's. Only
    // once nothing at all is active does "today" take over.
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
      const candidates = getInstancesForType(value as PeriodType);
      const defaultInstance =
        candidates.find((i) => i.startDate <= anchor && anchor <= i.endDate) ??
        candidates[candidates.length - 1];
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
    selectedType === YEAR_VALUE
      ? String(selectedYear ?? "")
      : (periodValue ?? "");

  // Both instance selects (Año's year list, and a period type's own
  // instance list) are the same control - one value, one label - just
  // sourced differently. Building one shared {value, label} shape means
  // there's a single Select block below instead of two copy-pasted ones.
  const instanceOptions: { value: string; label: string }[] =
    selectedType === YEAR_VALUE
      ? [...effectiveYears]
          .filter(yearFits)
          .sort((a, b) => a - b)
          .map((year) => ({ value: String(year), label: String(year) }))
      : instances.map((instance) => ({
          value: instance.value,
          label: instanceLabel(instance, locale),
        }));
  const selectedInstanceLabel =
    instanceOptions.find((option) => option.value === instanceValue)?.label ??
    "";

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
        {/* alignItemWithTrigger off: its default lines the *selected*
            item up with the trigger, which can open the popup upward
            past it once that item sits mid-list (e.g. "Trimestre",
            4th of 6 types) - always opening straight down below the
            trigger reads more predictably for a short list like this. */}
        {/* No "Todo el tiempo" item here on purpose - DateRangeFilter's
            own X/"Limpiar rango" is the one explicit way to drop the
            marked range; picking a value in *this* select should only
            ever narrow it, never quietly erase it. selectedType still
            falls back to ALL_VALUE (see above) for the instant right
            after marking a range and before a type is chosen - the
            trigger just shows that as a label, nothing here can select
            back into it. */}
        <SelectContent alignItemWithTrigger={false}>
          {yearOptionAvailable && (
            <SelectItem value={YEAR_VALUE}>{t("periodType.year")}</SelectItem>
          )}
          {availableTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {t(`periodType.${type}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedType !== ALL_VALUE && (
        <Select value={instanceValue} onValueChange={handleInstanceChange}>
          <SelectTrigger
            size="sm"
            className="w-auto gap-1.5 font-medium"
            aria-label={t("filterPeriodInstance")}
          >
            <SelectValue>{() => selectedInstanceLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {instanceOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
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

/** filterInstancesInRange against the marked boundary, when there is
 * one - the thin wrapper both call sites above (the rendered list, and
 * handleTypeChange's own candidates) share, so neither has to repeat
 * the "only when both ends are set" check. */
function clipToMarkedRange(
  instances: PeriodInstance[],
  markedStart?: string,
  markedEnd?: string,
): PeriodInstance[] {
  if (!markedStart || !markedEnd) return instances;
  return filterInstancesInRange(instances, markedStart, markedEnd);
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
  instance: PeriodInstance,
  locale: SupportedLocale,
): string {
  if (instance.startMonthKey === instance.endMonthKey) {
    return formatMonthKey(instance.startMonthKey, locale, true);
  }
  return `${formatMonthKey(instance.startMonthKey, locale, false)} – ${formatMonthKey(instance.endMonthKey, locale, true)}`;
}
