import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { utc } from '@date-fns/utc';

export function parseUTCDate(dateInput: Date | string | number): Date {
  if (typeof dateInput === 'string') {
    return parseISO(dateInput);
  }
  return new Date(dateInput);
}

export function formatDate(dateInput: Date | string | number): string {
  const dateObj = parseUTCDate(dateInput);

  return format(utc(dateObj), "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: es,
  });
}
