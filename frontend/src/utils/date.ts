import { parseISO } from 'date-fns';

export function parseDate(value: string | number | Date): Date {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'number') {
    return new Date(value);
  }
  return parseISO(value);
}
