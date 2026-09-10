const MONTHS = ['All months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const MONTH_INDEX = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

export { MONTHS };

export function parsePurnimaDate(value) {
  const match = value.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})/);
  if (!match) return new Date(NaN);
  return new Date(Number(match[3]), MONTH_INDEX[match[1]], Number(match[2]));
}

export function parseTiming(timing, year) {
  const [month, day] = timing.date.split(' ');
  const date = new Date(year, MONTH_INDEX[month], Number(day));
  const timeMatch = timing.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (timeMatch) {
    let hours = Number(timeMatch[1]) % 12;
    if (timeMatch[3].toUpperCase() === 'PM') hours += 12;
    date.setHours(hours, Number(timeMatch[2]), 0, 0);
  }
  return date;
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export function formatTime(date) {
  return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(date);
}

export function formatMonth(date) {
  return new Intl.DateTimeFormat('en-IN', { month: 'long' }).format(date);
}

export function formatDay(date) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'long' }).format(date);
}

export function isWeekend(date) {
  return date.getDay() === 0 || date.getDay() === 6;
}

export function nextMonday(date) {
  const result = new Date(date);
  const daysUntilMonday = date.getDay() === 0 ? 1 : 8 - date.getDay();
  if (isWeekend(date)) result.setDate(date.getDate() + daysUntilMonday);
  return result;
}

export function durationBetween(start, end) {
  const totalMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  return [days ? `${days}d` : '', hours ? `${hours}h` : '', minutes ? `${minutes}m` : '0m'].filter(Boolean).join(' ');
}
