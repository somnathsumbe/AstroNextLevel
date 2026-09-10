export const TARGET_DEGREES = [
  11.25, 22.5, 33.75, 45, 56.25, 60, 67.5, 78.75, 90, 101.25,
  112.5, 120, 123.75, 135, 146.25, 157.5, 168.75, 180, 191.25,
  202.5, 213.75, 225, 236.25, 240, 247.5, 258.75, 270, 281.25,
  292.15, 300, 303.75, 315, 326.25, 337.5, 348.75, 360,
];

export function parseUtcDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function dateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export function formatDay(date) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'long', timeZone: 'UTC' }).format(date);
}

export function monthName(date) {
  return new Intl.DateTimeFormat('en-IN', { month: 'long', timeZone: 'UTC' }).format(date);
}

export function addUtcDays(date, days) {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function isWeekend(date) {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

export function nextMonday(date) {
  if (!isWeekend(date)) return date;
  const days = date.getUTCDay() === 6 ? 2 : 1;
  return addUtcDays(date, days);
}

export function buildDegreeResults(zeroDate, degreePerYear = 360, daysPerYear = 365.25) {
  const degreePerDay = degreePerYear / daysPerYear;
  return TARGET_DEGREES.map((targetDegree, index) => {
    const days = Math.ceil(targetDegree / degreePerDay);
    const calendarDate = addUtcDays(zeroDate, days);
    const weekend = isWeekend(calendarDate);
    return {
      id: `${dateInputValue(zeroDate)}-${targetDegree}-${index}`,
      targetDegree,
      days,
      calendarDate,
      day: formatDay(calendarDate),
      marketStatus: weekend ? 'WEEKEND' : 'TRADING DAY',
      testDate: formatDate(nextMonday(calendarDate)),
      actualDegree: Number((days * degreePerDay).toFixed(4)),
      month: monthName(calendarDate),
      isWeekend: weekend,
    };
  });
}
