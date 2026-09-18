import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatDisplayDate } from '@/components/gann/GannUtils';

describe('gann date display formatting', () => {
  it('formats pressure high and low dates as ISO calendar display strings without changing source values', () => {
    expect(formatDisplayDate('03-08-2026')).toBe('2026-08-03');
    expect(formatDisplayDate('29-07-2026')).toBe('2026-07-29');
    expect(formatDisplayDate('2026-08-03')).toBe('2026-08-03');
    expect(formatDisplayDate('')).toBe('');
  });

  it('keeps the lunar section visible by default on the Today Stock page', () => {
    const file = readFileSync(path.resolve(process.cwd(), 'app/today-stock/page.jsx'), 'utf8');
    expect(file).toContain('useState(true)');
  });
});
