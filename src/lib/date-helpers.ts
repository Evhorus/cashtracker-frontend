import { format, formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { TZDate } from "@date-fns/tz";

function getDeviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function parseDateInput(dateInput: Date | string | number): Date {
  if (typeof dateInput === "string") {
    return parseISO(dateInput);
  }
  return new Date(dateInput);
}

/**
 * Parses a value that represents a pure calendar date (no meaningful
 * time-of-day) - e.g. an expense's `date`, backed by a Postgres `date`
 * column - into a `Date` at LOCAL midnight for that day, region-agnostic.
 *
 * Unlike `parseDateInput`, this never treats the value as an instant: the
 * API can (and does) echo a date-only value as a full UTC timestamp (e.g.
 * "2026-09-22T00:00:00.000Z"), so anything that runs it through
 * `parseISO` + device-timezone conversion (as `formatDate` does for real
 * instants like `createdAt`) shifts the day backward for any timezone
 * behind UTC (Bogotá, UTC-5, included). Reading only the "yyyy-MM-dd"
 * prefix and rebuilding the date from local components sidesteps that
 * entirely - the calendar day is fixed, regardless of device timezone.
 */
export function parseCalendarDate(dateInput: Date | string): Date {
  if (typeof dateInput === "string") {
    const [year, month, day] = dateInput.slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(
    dateInput.getFullYear(),
    dateInput.getMonth(),
    dateInput.getDate(),
  );
}

/**
 * Formats a calendar date (see `parseCalendarDate`) for the API as a plain
 * "yyyy-MM-dd" string, using LOCAL date components - never `toISOString()`,
 * which would convert through UTC and can shift the day for timezones
 * ahead of UTC before the request ever reaches the backend.
 */
export function formatCalendarDateForApi(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function toDeviceTimeZone(dateInput: Date): Date {
  return new TZDate(dateInput, getDeviceTimeZone());
}

export function formatDate(dateInput: Date | string | number): string {
  return format(
    toDeviceTimeZone(parseDateInput(dateInput)),
    "EEEE, d 'de' MMMM 'de' yyyy",
    { locale: es },
  );
}

/** Compact "mmm yyyy" form (e.g. "jul 2026") - for tight spaces like a card cell,
 * where the full formatDate() output ("miércoles, 15 de julio de 2026") doesn't fit. */
export function formatMonthYear(dateInput: Date | string | number): string {
  return format(toDeviceTimeZone(parseDateInput(dateInput)), "MMM yyyy", {
    locale: es,
  });
}

/** Compact "d MMM" form (e.g. "12 ago") - for a dense list of dated rows
 * (the dashboard's "Actividad reciente" widget), where even
 * formatMonthYear's "mmm yyyy" is more than the row needs: same year is
 * implied by context, the day is what actually varies row to row. */
export function formatShortDate(dateInput: Date | string | number): string {
  return format(toDeviceTimeZone(parseDateInput(dateInput)), "d MMM", {
    locale: es,
  });
}

/** Relative form (e.g. "hace 3 horas") - for activity timestamps (session
 * last-active) where the exact date matters less than how recent it was.
 * No timezone conversion needed, unlike the helpers above: the diff
 * between two instants is timezone-independent. */
export function formatRelativeTime(dateInput: Date | string | number): string {
  return formatDistanceToNow(parseDateInput(dateInput), {
    locale: es,
    addSuffix: true,
  });
}

export function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
