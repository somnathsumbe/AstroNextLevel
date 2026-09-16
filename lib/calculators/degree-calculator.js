import { addUtcDays, buildDegreeResults, dateInputValue, monthName, parseUtcDate } from '@/lib/degree-utils';

export function suppliedDate(entry) {
  if (!entry || typeof entry.date !== 'string') return '';
  const [day, month] = entry.date.split(' ');
  if (!day || !month) return '';
  const monthNumber = new Date(`${month} 1, ${entry.year} UTC`).getUTCMonth() + 1;
  return `${entry.year}-${String(monthNumber).padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function getValidZeroDates(entries = []) {
  return entries.map(suppliedDate).filter(Boolean);
}

export function getDefaultZeroDate(entries = []) {
  const validZeroDates = getValidZeroDates(entries);
  return validZeroDates.includes('2026-03-20') ? '2026-03-20' : validZeroDates[validZeroDates.length - 1] || '2026-03-20';
}

export function parseMonth(value) {
  return new Date(`${value} 1, 2026 UTC`).getUTCMonth();
}

export function todayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function validateZeroDate(value, validZeroDates = []) {
  return validZeroDates.includes(value);
}

export function getDegreeSummary(results = []) {
  const tradingDays = results.filter((result) => result.marketStatus === 'TRADING DAY').length;
  const nextReversal = results.find((result) => result.calendarDate >= todayUtc()) || results[0] || null;
  return {
    tradingDays,
    weekendDays: results.length - tradingDays,
    nextReversal,
    totalLevels: results.length,
  };
}

export function buildDefaultDegreeResults(zeroDate) {
  return buildDegreeResults(parseUtcDate(zeroDate));
}

export function getNextReversalNotice(nextResults, calendarDate = todayUtc()) {
  const todayValue = dateInputValue(calendarDate);
  const tomorrowValue = dateInputValue(addUtcDays(parseUtcDate(todayValue), 1));
  return nextResults.find((result) => [todayValue, tomorrowValue].includes(dateInputValue(result.calendarDate)));
}

export function getMonthOptions() {
  return ['All months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
}

export function getMonthLabelFromDate(date) {
  return monthName(date);
}
