export const PUSHYA_MONTHS = ['All months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function parseIsoDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatPushyaDate(value) {
  const date = value instanceof Date ? value : parseIsoDate(value);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = new Intl.DateTimeFormat('en-IN', { month: 'long', timeZone: 'UTC' }).format(date);
  return `${day}-${month}-${date.getUTCFullYear()}`;
}

export function formatPushyaTime(value) {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date(Date.UTC(2020, 0, 1, hours, minutes));
  return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }).format(date);
}

export function parsePushyaDateTime(dateValue, timeValue) {
  const [year, month, day] = dateValue.split('-').map(Number);
  const [hours, minutes] = timeValue.split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes));
}

export function getPushyaWeekday(value) {
  const date = value instanceof Date ? value : parseIsoDate(value);
  return new Intl.DateTimeFormat('en-IN', { weekday: 'long', timeZone: 'UTC' }).format(date);
}

export function dateKey(value) {
  const date = value instanceof Date ? value : parseIsoDate(value);
  return date.toISOString().slice(0, 10);
}

export function isWeekendDate(value) {
  const date = value instanceof Date ? value : parseIsoDate(value);
  return date.getUTCDay() === 0 || date.getUTCDay() === 6;
}

export function getNextMonday(value) {
  const date = value instanceof Date ? new Date(value) : parseIsoDate(value);
  if (!isWeekendDate(date)) return null;
  date.setUTCDate(date.getUTCDate() + (date.getUTCDay() === 6 ? 2 : 1));
  return date;
}

export function buildPushyaRecord(yearData, event, index) {
  const endDate = parseIsoDate(event.endDate);
  const weekend = isWeekendDate(endDate);
  const testDate = getNextMonday(endDate);
  return {
    ...event,
    id: `pushya-${event.year}-${event.startDate}-${index}`,
    nakshatra: yearData.nakshatra,
    verificationStatus: yearData.verificationStatus,
    secondarySource: yearData.secondarySource,
    startDateLabel: formatPushyaDate(event.startDate),
    endDateLabel: formatPushyaDate(event.endDate),
    startTimeLabel: formatPushyaTime(event.startTime),
    endTimeLabel: formatPushyaTime(event.endTime),
    day: getPushyaWeekday(endDate),
    month: new Intl.DateTimeFormat('en-IN', { month: 'long', timeZone: 'UTC' }).format(endDate),
    isWeekend: weekend,
    marketStatus: weekend ? 'WEEKEND' : 'TRADING DAY',
    testDate: testDate ? formatPushyaDate(testDate) : '-',
    startDateTime: parsePushyaDateTime(event.startDate, event.startTime),
    endDateTime: parsePushyaDateTime(event.endDate, event.endTime),
  };
}
