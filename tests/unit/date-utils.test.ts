import { describe, expect, it } from 'vitest';
import {
  formatPressureDate,
  getIndiaToday,
  parseIndianDate,
  pressureDateKey,
} from '@/lib/date/date-utils';

describe('date utilities', () => {
  it('parses valid Indian dates and rejects invalid calendar dates', () => {
    expect(parseIndianDate('15/08/2024')).toBeInstanceOf(Date);
    expect(parseIndianDate('31/02/2024')).toBeNull();
    expect(parseIndianDate('VERIFY_REQUIRED')).toBeNull();
  });

  it('normalizes supported date formats to an India pressure-date key', () => {
    expect(pressureDateKey('15/08/2024')).toBe('2024-08-15');
    expect(pressureDateKey('2024-08-15')).toBe('2024-08-15');
    expect(pressureDateKey('03 Oct 2026')).toBe('2026-10-03');
    expect(pressureDateKey('not-a-date')).toBe('');
  });

  it('handles the India timezone around a UTC day boundary', () => {
    expect(getIndiaToday(new Date('2024-01-01T00:00:00.000Z'))).toBe('2024-01-01');
    expect(getIndiaToday(new Date('2023-12-31T18:29:59.000Z'))).toBe('2023-12-31');
    expect(getIndiaToday(new Date('2023-12-31T18:30:00.000Z'))).toBe('2024-01-01');
  });

  it('formats a deterministic pressure date using the configured locale', () => {
    expect(formatPressureDate(new Date('2024-08-15T06:00:00.000Z'))).toBe('15 Aug 2024');
  });
});
