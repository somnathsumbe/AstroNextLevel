export const MARKET_MONTHS = ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function parseDateOnly(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatLongDate(value) {
  const date = typeof value === 'string' ? parseDateOnly(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  const month = new Intl.DateTimeFormat('en-IN', { month: 'long', timeZone: 'UTC' }).format(date);
  return `${String(date.getUTCDate()).padStart(2, '0')}-${month}-${date.getUTCFullYear()}`;
}

export function isWeekend(day) { return day === 'Saturday' || day === 'Sunday'; }
export function dateKey(date) { return date.toISOString().slice(0, 10); }
export function monthName(date) { return new Intl.DateTimeFormat('en-IN', { month: 'long', timeZone: 'UTC' }).format(date); }

export function buildMarketRow(year, event, index) {
  const date = parseDateOnly(event.crossingDate);
  return {
    ...event,
    year,
    index,
    id: `weekly-degree-${year}-${event.crossingDate}-${index}`,
    date,
    dateLabel: formatLongDate(date),
    month: monthName(date),
    weekend: isWeekend(event.day),
  };
}
