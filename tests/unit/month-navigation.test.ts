import { describe, expect, it } from 'vitest';
import {
  defaultMonthOption,
  matchesMonthFilter,
  monthOptionsWithCurrent,
  shiftMonthOption,
} from '@/lib/month-navigation';

describe('month navigation helpers', () => {
  it('defaults to the current month when no explicit month is selected', () => {
    const currentMonth = new Date().getMonth();
    const currentMonthName = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ][currentMonth];

    const defaultValue = defaultMonthOption();

    expect(defaultValue).toBe(currentMonthName);
  });

  it('moves backward and forward across year boundaries correctly', () => {
    expect(shiftMonthOption('January', -1, monthOptionsWithCurrent())).toBe('December');
    expect(shiftMonthOption('December', 1, monthOptionsWithCurrent())).toBe('January');
    expect(shiftMonthOption('All Months', -1, monthOptionsWithCurrent())).toBe('December');
    expect(shiftMonthOption('All Months', 1, monthOptionsWithCurrent())).toBe('January');
  });

  it('preserves the all-month option while keeping the current month as default behaviour', () => {
    const options = monthOptionsWithCurrent();
    expect(options[0]).toBe('All Months');
    expect(options).toContain('January');
    expect(options).toContain('December');
  });

  it('treats the all-month selector as no month filter', () => {
    expect(matchesMonthFilter('September', 'All Months')).toBe(true);
    expect(matchesMonthFilter('September', 'All months')).toBe(true);
    expect(matchesMonthFilter('September', 'January')).toBe(false);
  });
});
