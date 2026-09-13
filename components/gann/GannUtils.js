const INDIA_TIME_ZONE = 'Asia/Kolkata';

export function getIndiaTodayKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: INDIA_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function pressureDateKey(value) {
  if (!value) return '';
  const match = String(value).trim().match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/);
  if (!match) return '';
  const parsed = new Date(`${match[1]} ${match[2]} ${match[3]} 00:00:00 GMT+0530`);
  return Number.isNaN(parsed.getTime()) ? '' : getIndiaTodayKey(parsed);
}

export function isTodayPressureDate(value, todayKey = getIndiaTodayKey()) {
  return pressureDateKey(value) === todayKey;
}

export function formatNumber(value) {
  return value === null || value === undefined || value === '' ? '-' : Number(value).toFixed(2);
}

export function planetIcon(value) {
  return value && !String(value).includes('ð') ? value : '';
}