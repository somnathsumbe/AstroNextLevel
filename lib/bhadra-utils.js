const MONTHS = ['All months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_INDEX = { January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11 };
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export { MONTHS };

export function parseBhadraDateTime(value, fallbackYear) {
  const match = value.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+([A-Za-z]+)\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i);
  if (!match) return new Date(NaN);
  const [, month, day, , hoursText, minutesText, meridiem] = match;
  const year = Number(value.match(/\d{4}/)?.[0] || fallbackYear);
  let hours = Number(hoursText) % 12;
  if (meridiem.toUpperCase() === 'PM') hours += 12;
  return new Date(Date.UTC(year, MONTH_INDEX[month], Number(day), hours, Number(minutesText)));
}

export function formatBhadraDate(date) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export function formatBhadraTime(date) {
  return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' }).format(date);
}

export function getWeekday(date) {
  return WEEKDAYS[date.getUTCDay()];
}

export function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

export function isWeekendDate(date) {
  return date.getUTCDay() === 0 || date.getUTCDay() === 6;
}

export function isWithinIndianMarketSession(date) {
  const day = date.getUTCDay();
  if (day === 0 || day === 6) return false;
  const minutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  return minutes >= 9 * 60 + 15 && minutes <= 15 * 60 + 30;
}

export function buildBhadraRecord(record, index) {
  const startDateTime = parseBhadraDateTime(record.start, record.year);
  const endDateTime = parseBhadraDateTime(record.end, record.year);
  return {
    ...record,
    id: `bhadra-${record.year}-${dateKey(startDateTime)}-${index}`,
    startDateTime,
    endDateTime,
    startDate: formatBhadraDate(startDateTime),
    endDate: formatBhadraDate(endDateTime),
    startDay: getWeekday(startDateTime),
    startTime: formatBhadraTime(startDateTime),
    endTime: formatBhadraTime(endDateTime),
    eventDate: dateKey(startDateTime),
    isWeekend: isWeekendDate(startDateTime),
    startInSession: isWithinIndianMarketSession(startDateTime),
    endInSession: isWithinIndianMarketSession(endDateTime),
  };
}
