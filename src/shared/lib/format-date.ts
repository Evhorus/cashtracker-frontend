import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

export function formatDate(dateInput: Date): string {
  return dayjs(dateInput).format('dddd, D [de] MMMM [de] YYYY');
}

// export function formatDate(dateInput: string | Date): string {
//   if (!dateInput) return '';

//   const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

//   return date.toLocaleDateString('es-CO', {
//     weekday: 'long',
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//     timeZone: 'America/Bogota',
//   });
// }
