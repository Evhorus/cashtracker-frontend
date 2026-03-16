import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDate(dateInput: Date | string | number): string {
  let dateObj: Date;
  
  if (typeof dateInput === 'string') {
    dateObj = parseISO(dateInput);
  } else {
    dateObj = new Date(dateInput);
  }

  return format(dateObj, "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: es,
  });
}
