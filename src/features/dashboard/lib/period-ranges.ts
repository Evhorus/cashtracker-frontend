/**
 * Pure calendar math for the statistics page's period-shortcut filter
 * (Mes/Trimestre/Cuatrimestre/Semestre) - turns "give me every quarter
 * across these years" into the exact startDate/endDate pairs
 * DateRangeFilter already sends the backend, without the user having to
 * click through a calendar. No React, no fetching, so it's testable on
 * its own (see period-ranges.test.ts) the same way dashboard-summary.ts
 * is.
 *
 * Dates are computed directly as UTC year/month/day components, the
 * same anchor `parseCalendarDate` (date-helpers.ts) uses for values
 * that cross the server/client boundary - there's no real instant here
 * to convert, just a calendar boundary, so UTC math is unambiguous
 * regardless of which runtime builds it.
 */

export type PeriodType = "month" | "quarter" | "fourMonth" | "semester";

export interface PeriodInstance {
  /** Stable key for the URL (`periodValue`) and for re-finding this
   * instance in a freshly computed list on the next render. */
  value: string;
  /** "YYYY-MM" of the period's first/last month - feeds
   * `formatMonthKey` (date-helpers.ts) for the display label. */
  startMonthKey: string;
  endMonthKey: string;
  /** "yyyy-MM-dd", ready for the startDate/endDate query params. */
  startDate: string;
  endDate: string;
}

/** How many calendar months each period type spans, and the value's
 * one-letter/word prefix (month uses the "YYYY-MM" key itself instead). */
const PERIOD_SPANS: Record<
  Exclude<PeriodType, "month">,
  { months: number; prefix: string }
> = {
  quarter: { months: 3, prefix: "Q" },
  fourMonth: { months: 4, prefix: "F" },
  semester: { months: 6, prefix: "S" },
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function monthKey(year: number, month0: number): string {
  return `${year}-${pad2(month0 + 1)}`;
}

/** Last day of the given UTC month, as "yyyy-MM-dd" - day 0 of the
 * *next* month rolls back to the last day of this one, leap years
 * included, without a date library. */
function lastDayOfMonth(year: number, month0: number): string {
  const date = new Date(Date.UTC(year, month0 + 1, 0));
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

function firstDayOfMonth(year: number, month0: number): string {
  return `${year}-${pad2(month0 + 1)}-01`;
}

/**
 * Every instance of `type` across `years`, in calendar order - oldest
 * year first and, within a year, earliest period first - so a dropdown
 * built from this reads top-to-bottom the way a timeline does ("de
 * donde inicia hasta donde termina"), not newest-first. Every year in
 * `years` gets the full set of periods regardless of whether they've
 * happened yet or have any data - same as the calendar's exact-range
 * picker already lets you pick any date, dated or not (see
 * date-range-filter.tsx).
 */
export function getPeriodInstances(
  type: PeriodType,
  years: number[],
): PeriodInstance[] {
  const sortedYears = [...years].sort((a, b) => a - b);

  if (type === "month") {
    return sortedYears.flatMap((year) =>
      Array.from({ length: 12 }, (_, month0) => ({
        value: monthKey(year, month0),
        startMonthKey: monthKey(year, month0),
        endMonthKey: monthKey(year, month0),
        startDate: firstDayOfMonth(year, month0),
        endDate: lastDayOfMonth(year, month0),
      })),
    );
  }

  const { months, prefix } = PERIOD_SPANS[type];
  const periodsPerYear = 12 / months;

  return sortedYears.flatMap((year) =>
    Array.from({ length: periodsPerYear }, (_, index) => {
      const startMonth0 = index * months;
      const endMonth0 = startMonth0 + months - 1;
      return {
        value: `${year}-${prefix}${index + 1}`,
        startMonthKey: monthKey(year, startMonth0),
        endMonthKey: monthKey(year, endMonth0),
        startDate: firstDayOfMonth(year, startMonth0),
        endDate: lastDayOfMonth(year, endMonth0),
      };
    }),
  );
}

/**
 * Instances that overlap ["yyyy-MM-dd" `rangeStart`, `rangeEnd`] -
 * keeps a period-type dropdown limited to what a hand-picked
 * DateRangeFilter range actually covers, instead of every period across
 * every year that range's endpoints happen to fall in. A range starting
 * 1 Jul only overlaps the second half of that year onward - "ene - jun"
 * of the same year never happened as far as the marked range is
 * concerned, so it's dropped; a period the range only partially
 * overlaps (its last day, say) still counts and is kept.
 */
export function filterInstancesInRange(
  instances: PeriodInstance[],
  rangeStart: string,
  rangeEnd: string,
): PeriodInstance[] {
  return instances.filter(
    (instance) =>
      instance.endDate >= rangeStart && instance.startDate <= rangeEnd,
  );
}

/**
 * Whether `type` has at least one instance that fits entirely inside
 * ["yyyy-MM-dd" `rangeStart`, `rangeEnd`] - stricter than
 * filterInstancesInRange's overlap test, and what decides whether a
 * period *type* is worth offering at all for a marked range. A 2-month
 * mark (1 Jul - 1 Sep) can't fit a calendar quarter (3 months) no
 * matter which one - every quarter would spill past the mark - so
 * "Trimestre" has nothing legible to offer there, even though "Mes"
 * (August fits) does.
 */
export function typeFitsWithinRange(
  type: PeriodType,
  years: number[],
  rangeStart: string,
  rangeEnd: string,
): boolean {
  return getPeriodInstances(type, years).some(
    (instance) =>
      instance.startDate >= rangeStart && instance.endDate <= rangeEnd,
  );
}

/** Same containment test as typeFitsWithinRange, for the whole-year
 * shortcut (which isn't a PeriodType/getPeriodInstances entry). */
export function yearFitsWithinRange(
  year: number,
  rangeStart: string,
  rangeEnd: string,
): boolean {
  return `${year}-01-01` >= rangeStart && `${year}-12-31` <= rangeEnd;
}
