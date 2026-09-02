import { format, formatDistanceToNow, parseISO } from "date-fns";
import { enUS, es } from "date-fns/locale";

import type { SupportedLocale } from "@/i18n/config";
import { TZDate } from "@date-fns/tz";

/**
 * Every display formatter below takes the reader's locale explicitly
 * rather than closing over one. They used to hardcode `locale: es`, so
 * an English reader got "miércoles, 15 de julio de 2026" inside an
 * otherwise-English page. It's a parameter and not a module-level
 * variable because these run in both Server and Client Components, in
 * the same process, for different readers - there is no single ambient
 * answer to cache.
 *
 * The API-facing and parsing helpers take no locale: their output is a
 * wire format or a Date, not something anybody reads.
 */
/** Exported so callers that hand a date-fns Locale object straight to a
 * third-party component (e.g. react-day-picker's Calendar) can look one
 * up per-locale instead of hardcoding `es` the way expense-form.tsx's
 * date picker still does today. */
export const DATE_FNS_LOCALES = { es, en: enUS } as const satisfies Record<
  SupportedLocale,
  unknown
>;

/** Long form, e.g. "miércoles, 15 de julio de 2026" / "Wednesday, 15
 * July 2026". Spelled per-locale rather than one pattern with a
 * translated month name - Spanish needs the "de" separators English
 * doesn't have. */
const LONG_DATE_PATTERN = {
  es: "EEEE, d 'de' MMMM 'de' yyyy",
  en: "EEEE, d MMMM yyyy",
} as const satisfies Record<SupportedLocale, string>;

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
 * Parses an API value that represents a pure calendar date (no meaningful
 * time-of-day) - e.g. an expense's `date`, backed by a Postgres `date`
 * column - into a `Date` anchored at UTC midnight for that day. This is
 * the canonical, environment-independent representation: reading it back
 * via UTC getters (see `formatCalendarDate` below) always reproduces the
 * same Y/M/D no matter which runtime does the reading.
 *
 * That "no matter which runtime" part is the whole reason this exists,
 * not just a style choice. The API can (and does) echo a date-only value
 * as a full UTC timestamp (e.g. "2026-09-22T00:00:00.000Z"); this reads
 * only the "yyyy-MM-dd" prefix rather than treating it as an instant, so
 * `parseISO` + timezone conversion never enters the picture here. And
 * this value doesn't stay on one runtime: `ExpenseMapper.fromApi` (which
 * calls this) runs wherever the Server Component fetching the expense
 * runs - the local dev server, or a Vercel Lambda pinned to UTC in
 * production - and the resulting `Date` is then serialized as a prop
 * into Client Components (expense-card.tsx, expenses-list.tsx) that
 * render in the actual visitor's browser. A LOCAL-midnight anchor (this
 * function's previous implementation) is only self-consistent when the
 * same runtime both builds and reads it; the server/client split above
 * breaks that assumption; UTC-anchoring plus UTC-only reads doesn't
 * depend on it in the first place.
 *
 * Not for the expense FORM's own live state while editing - the Calendar
 * widget (react-day-picker) reads a Date's LOCAL getters to decide what's
 * selected, so the form needs a browser-local-anchored Date instead. See
 * `toFormCalendarDate` (API -> form) and `formatCalendarDateForApi` (form
 * -> API) for that side.
 */
export function parseCalendarDate(dateInput: string): Date {
  const [year, month, day] = dateInput.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Converts a canonical UTC-anchored calendar date (see `parseCalendarDate`,
 * e.g. `expense.date`) into a browser-local-anchored `Date` for the
 * expense form's Calendar widget to pre-select when editing - the
 * opposite direction of `formatCalendarDateForApi`. Always runs
 * client-side (the form is a Client Component), so reading via the
 * browser's own local getters here is safe: this call and react-day-
 * picker's own reads happen in the same runtime.
 */
export function toFormCalendarDate(date: Date): Date {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Formats a browser-local-anchored calendar date (the expense form's own
 * live state - `getToday()`, or whatever the Calendar widget/
 * `toFormCalendarDate` produced) for the API as a plain "yyyy-MM-dd"
 * string, using LOCAL date components - never `toISOString()`, which
 * would convert through UTC and can shift the day for timezones ahead of
 * UTC before the request ever reaches the backend. Always runs
 * client-side, so "local" unambiguously means the visitor's own
 * timezone here - unlike parseCalendarDate's UTC anchor, which exists
 * specifically because ITS values do cross into other runtimes.
 */
export function formatCalendarDateForApi(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function toDeviceTimeZone(dateInput: Date): Date {
  return new TZDate(dateInput, getDeviceTimeZone());
}

/**
 * Formats a canonical UTC-anchored calendar date (see `parseCalendarDate`)
 * for display - reading its UTC wall-clock, never the ambient/device
 * timezone `formatDate`/`formatMonthYear` use for real instants
 * (createdAt/updatedAt, where ambient-timezone conversion is exactly what
 * you want). A calendar date has to render identically no matter which
 * environment does the formatting - use this, not formatDate, for
 * `expense.date` at every display call site, server or client.
 */
export function formatCalendarDate(
  date: Date,
  locale: SupportedLocale,
): string {
  return format(new TZDate(date, "UTC"), LONG_DATE_PATTERN[locale], {
    locale: DATE_FNS_LOCALES[locale],
  });
}

/** Compact "d MMM" form of formatCalendarDate. Unlike formatDate/
 * formatMonthYear (which convert a real instant into the device's
 * timezone), this reads the date's UTC wall-clock - see
 * formatCalendarDate above for why a calendar date must not be
 * timezone-converted. */
export function formatCalendarDateShort(
  date: Date,
  locale: SupportedLocale,
): string {
  return format(new TZDate(date, "UTC"), "d MMM", {
    locale: DATE_FNS_LOCALES[locale],
  });
}

export function formatDate(
  dateInput: Date | string | number,
  locale: SupportedLocale,
): string {
  return format(
    toDeviceTimeZone(parseDateInput(dateInput)),
    LONG_DATE_PATTERN[locale],
    { locale: DATE_FNS_LOCALES[locale] },
  );
}

/** Compact "mmm yyyy" form (e.g. "jul 2026") - for tight spaces like a card cell,
 * where the full formatDate() output ("miércoles, 15 de julio de 2026") doesn't fit. */
export function formatMonthYear(
  dateInput: Date | string | number,
  locale: SupportedLocale,
): string {
  return format(toDeviceTimeZone(parseDateInput(dateInput)), "MMM yyyy", {
    locale: DATE_FNS_LOCALES[locale],
  });
}

/** Relative form (e.g. "hace 3 horas") - for activity timestamps (session
 * last-active) where the exact date matters less than how recent it was.
 * No timezone conversion needed, unlike the helpers above: the diff
 * between two instants is timezone-independent. */
export function formatRelativeTime(
  dateInput: Date | string | number,
  locale: SupportedLocale,
): string {
  return formatDistanceToNow(parseDateInput(dateInput), {
    locale: DATE_FNS_LOCALES[locale],
    addSuffix: true,
  });
}

/**
 * Today, as a browser-local-anchored calendar date for the expense
 * form's own live state (see `toFormCalendarDate`) - always called
 * client-side, so reading `new Date()`'s local getters here correctly
 * means "today for this visitor," not parseCalendarDate's UTC anchor
 * (which exists for values that cross into other runtimes; this one
 * never does).
 */
export function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Formats a "YYYY-MM" month key (the shape the dashboard summary
 * endpoint reports) as a short month name, optionally with the year.
 *
 * Parsed as a UTC calendar value, not `new Date("2026-08")` - that
 * would be read as UTC midnight and then converted to the device zone,
 * which lands in July for anywhere behind UTC. Same hazard the
 * calendar-date helpers above exist for.
 */
export function formatMonthKey(
  monthKey: string,
  locale: SupportedLocale,
  includeYear: boolean,
): string {
  const [year, month] = monthKey.split("-").map(Number);

  if (!year || !month) return monthKey;

  return format(
    new TZDate(Date.UTC(year, month - 1, 1), "UTC"),
    includeYear ? "MMM yyyy" : "MMM",
    { locale: DATE_FNS_LOCALES[locale] },
  );
}
