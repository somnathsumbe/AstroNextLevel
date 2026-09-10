const MONTHS = ['All months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export { MONTHS };

export function parseDateOnly(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDisplayDate(date) {
  const month = new Intl.DateTimeFormat('en-IN', { month: 'long', timeZone: 'UTC' }).format(date);
  return `${String(date.getUTCDate()).padStart(2, '0')}-${month}-${date.getUTCFullYear()}`;
}

export function formatDisplayTime(value) {
  return value;
}

export function getPreviousDate(date) {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() - 1);
  return result;
}

export function getNextDate(date) {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + 1);
  return result;
}

export function getWeekday(date) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'long', timeZone: 'UTC' }).format(date);
}

export function isWeekend(date) {
  return date.getUTCDay() === 0 || date.getUTCDay() === 6;
}

export function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

export function formatEventLabel(value) {
  return value.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

export function buildMangalRow(year, event, index) {
  const eventDate = parseDateOnly(event.date);
  const previousDate = getPreviousDate(eventDate);
  const nextDate = getNextDate(eventDate);
  return {
    ...event,
    year,
    index,
    id: `mangal-${year}-${event.date}-${index}`,
    eventDate,
    previousDate,
    nextDate,
    dateLabel: formatDisplayDate(eventDate),
    previousDateLabel: formatDisplayDate(previousDate),
    nextDateLabel: formatDisplayDate(nextDate),
    day: getWeekday(eventDate),
    month: MONTH_NAMES[eventDate.getUTCMonth()],
    eventLabel: formatEventLabel(event.event),
    status: isWeekend(eventDate) ? 'WEEKEND' : 'TRADING DAY',
  };
}
