export const PANCHAK_MONTHS = ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_INDEX = { January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11 };

export function parsePanchakDateTime(value) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i);
  if (!match) return new Date(NaN);
  const [, year, month, day, hourText, minuteText, meridiem] = match;
  let hours = Number(hourText) % 12;
  if (meridiem.toUpperCase() === 'PM') hours += 12;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), hours, Number(minuteText)));
}

export function parseDateOnly(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDisplayDate(date) {
  const month = new Intl.DateTimeFormat('en-IN', { month: 'long', timeZone: 'UTC' }).format(date);
  return `${String(date.getUTCDate()).padStart(2, '0')}-${month}-${date.getUTCFullYear()}`;
}

export function formatDisplayTime(date) {
  return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' }).format(date);
}

export function getWeekday(date) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'long', timeZone: 'UTC' }).format(date);
}

export function isWeekend(date) {
  return date.getUTCDay() === 0 || date.getUTCDay() === 6;
}

export function getNextMonday(date) {
  if (!isWeekend(date)) return null;
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + (date.getUTCDay() === 6 ? 2 : 1));
  return result;
}

export function getMarketDayStatus(date) {
  return isWeekend(date) ? 'WEEKEND' : 'TRADING DAY';
}

export function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

export function buildPanchakRow(entry, index) {
  const startDateTime = parsePanchakDateTime(entry.start);
  const endDateTime = parsePanchakDateTime(entry.end);
  const testDate = getNextMonday(startDateTime);
  return {
    ...entry,
    index,
    startDateTime,
    endDateTime,
    startDateFormatted: formatDisplayDate(startDateTime),
    startTimeFormatted: formatDisplayTime(startDateTime),
    endDateFormatted: formatDisplayDate(endDateTime),
    endTimeFormatted: formatDisplayTime(endDateTime),
    startDay: getWeekday(startDateTime),
    endDay: getWeekday(endDateTime),
    marketStatus: getMarketDayStatus(startDateTime),
    testDate: testDate ? formatDisplayDate(testDate) : '-',
    startDateKey: dateKey(startDateTime),
  };
}
