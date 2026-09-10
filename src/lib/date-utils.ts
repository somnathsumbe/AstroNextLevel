const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatLongDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day || !MONTHS[month - 1]) return value;
  return `${String(day).padStart(2, '0')}-${MONTHS[month - 1]}-${year}`;
}

export function monthName(value: string): string {
  const month = Number(value.split('-')[1]);
  return MONTHS[month - 1] || '';
}

export function dateKey(value: string): number {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

export function isWeekend(day: string): boolean {
  return day === 'Saturday' || day === 'Sunday';
}

function utcDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function toIsoDate(value: Date): string {
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, '0')}-${String(value.getUTCDate()).padStart(2, '0')}`;
}

export function getNextMonday(value: string): string {
  const date = utcDate(value);
  const day = date.getUTCDay();
  if (day === 6) date.setUTCDate(date.getUTCDate() + 2);
  if (day === 0) date.setUTCDate(date.getUTCDate() + 1);
  return toIsoDate(date);
}

export function getWeekMonday(value: string): string {
  const date = utcDate(value);
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - (day === 0 ? 6 : day - 1));
  return toIsoDate(date);
}

export function getWeekFriday(value: string): string {
  const date = utcDate(getWeekMonday(value));
  date.setUTCDate(date.getUTCDate() + 4);
  return toIsoDate(date);
}
