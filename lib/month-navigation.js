export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function monthOptionsWithCurrent() {
  return ['All Months', ...MONTH_NAMES];
}

export function defaultMonthOption(date = new Date()) {
  return MONTH_NAMES[date.getMonth()];
}

export function formatMonthLabel(value, year = new Date().getFullYear()) {
  const monthName = value && value !== 'All Months' && value !== 'All months'
    ? value
    : defaultMonthOption();
  return `${monthName} ${year}`;
}

export function shiftMonthOption(currentValue, direction, options = monthOptionsWithCurrent()) {
  const monthOptions = options.filter((option) => option && option !== 'All Months' && option !== 'All months');
  const resolvedOptions = monthOptions.length > 0 ? monthOptions : MONTH_NAMES;

  if (!currentValue || currentValue === 'All Months' || currentValue === 'All months') {
    return direction < 0 ? resolvedOptions[resolvedOptions.length - 1] : resolvedOptions[0];
  }

  const currentIndex = resolvedOptions.indexOf(currentValue);
  if (currentIndex === -1) {
    return resolvedOptions[0];
  }

  const nextIndex = (currentIndex + direction + resolvedOptions.length) % resolvedOptions.length;
  return resolvedOptions[nextIndex];
}

export function matchesMonthFilter(recordMonth, selectedMonth) {
  if (!selectedMonth || selectedMonth === 'All Months' || selectedMonth === 'All months') {
    return true;
  }

  return recordMonth === selectedMonth;
}
