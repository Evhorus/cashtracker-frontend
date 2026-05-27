import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { tz } from "@date-fns/tz";

const APP_TIMEZONE = "America/Bogota";

export function parseUTCDate(dateInput: Date | string | number): Date {
  if (typeof dateInput === "string") {
    return parseISO(dateInput);
  }
  return new Date(dateInput);
}

/**
 * Converts a UTC date to the application's local timezone
 * @param dateInput - Date object (expected to be in UTC)
 * @returns Date object adjusted to the app's timezone
 */
function convertToAppTimezone(dateInput: Date): Date {
  return tz(APP_TIMEZONE)(dateInput) as unknown as Date;
}

export function formatDate(dateInput: Date | string | number): string {
  const dateObj = parseUTCDate(dateInput);
  const zonedDate = convertToAppTimezone(dateObj);

  return format(zonedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: es,
  });
}

/**
 * Gets the current date in the application's timezone
 * @returns Today's date in the app's timezone
 */
export function getTodayInAppTimezone(): Date {
  const now = new Date();
  return tz(APP_TIMEZONE)(now) as unknown as Date;
}
