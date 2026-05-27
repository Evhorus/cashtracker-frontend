import { format, parseISO } from "date-fns";
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

export function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
