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
