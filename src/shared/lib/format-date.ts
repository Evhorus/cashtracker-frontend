import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

export function formatDate(dateInput: Date): string {
  return dayjs(dateInput).format('dddd, D [de] MMMM [de] YYYY');
}
