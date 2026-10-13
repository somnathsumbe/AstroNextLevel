import { describe, expect, it } from 'vitest';
import { indraYogaService } from '@/lib/data/services/astrology/indra-yoga.service';
import {
  appendTodaysIndraYogaEvents,
  filterIndraYogaEntries,
  formatIndraYogaDate,
  formatIndraYogaTime,
  getIndraYogaDateKey,
  getTodaysIndraYogaEntries,
  isIndraYogaStartingToday,
  sortIndraYogaEntries,
  toIndraYogaAstroEvents,
  validateIndraYogaEntries,
} from '@/lib/indra-yoga-utils';

const entries = [
  {
    date: '2026-Mar-07',
    weekday: 'Sat',
    yoga: 'Indra Yoga',
    begins: { date: '2026-Mar-07', time: '14:34' },
    ends: { date: '2026-Mar-08', time: '05:16' },
  },
  {
    date: '2026-Jan-15',
    weekday: 'Thu',
    yoga: 'Indra Yoga',
    begins: { date: '2026-Jan-15', time: '09:05' },
    ends: { date: '2026-Jan-16', time: '05:16' },
  },
];

describe('IndraYog data utilities', () => {
  it('normalizes named-month dates without converting their calendar day through UTC', () => {
    expect(getIndraYogaDateKey('2026-Mar-07')).toBe('2026-03-07');
    expect(getIndraYogaDateKey('2026-02-30')).toBeNull();
  });

  it('formats dates and source 24-hour times for display', () => {
    expect(formatIndraYogaDate('2026-Jan-15')).toBe('15 Jan 2026');
    expect(formatIndraYogaTime('00:01')).toBe('12:01 AM');
    expect(formatIndraYogaTime('14:34')).toBe('02:34 PM');
  });

  it('sorts chronologically by the begins date and time', () => {
    expect(sortIndraYogaEntries(entries).map((entry) => entry.begins.date)).toEqual(['2026-Jan-15', '2026-Mar-07']);
  });

  it('combines year, month, and case-insensitive search filters', () => {
    expect(filterIndraYogaEntries(entries, { year: '2026', month: '3', search: 'INDRA' })).toEqual([entries[0]]);
    expect(filterIndraYogaEntries(entries, { year: '2026', month: '2' })).toEqual([]);
    expect(filterIndraYogaEntries(entries, { search: '05:16' })).toHaveLength(2);
  });

  it('matches today against the local begins calendar date, not the ends date', () => {
    const today = new Date(2026, 2, 7, 23, 30);
    expect(getTodaysIndraYogaEntries(entries, today)).toEqual([entries[0]]);
    expect(isIndraYogaStartingToday(entries[0], new Date(2026, 2, 8, 0, 1))).toBe(false);
    expect(getTodaysIndraYogaEntries(entries, new Date(2026, 2, 8, 0, 1))).toEqual([]);
  });

  it('converts matching source entries into stable events for the existing Astro Events cards', () => {
    const [event] = toIndraYogaAstroEvents([entries[0]]);
    expect(event).toMatchObject({
      id: 'indra-yoga-2026-03-07-14:34',
      type: 'INDRA_YOGA',
      title: 'IndraYog',
      route: '/indra-yog',
      eventDate: '2026-03-07',
      startTime: '02:34 PM',
      endTime: '05:16 AM',
      endDate: '2026-03-08',
    });
    expect(toIndraYogaAstroEvents([entries[0]])[0].id).toBe(event.id);
  });

  it('appends matching events to existing Astro Events without modifying or duplicating them', () => {
    const now = new Date(2026, 2, 7, 12);
    const existingEvents = [{ id: 'existing-astro-event', type: 'PURNIMA' }];
    const result = appendTodaysIndraYogaEvents(existingEvents, entries, now);
    const indraYogaEvents = result.filter((event) => event.type === 'INDRA_YOGA');

    expect(result[0]).toBe(existingEvents[0]);
    expect(indraYogaEvents).toHaveLength(1);
    expect(indraYogaEvents[0].eventDate).toBe('2026-03-07');
    expect(new Set(result.map((event) => event.id)).size).toBe(result.length);
    expect(appendTodaysIndraYogaEvents(existingEvents, entries, now)).toHaveLength(result.length);
  });

  it('rejects entries that do not follow the source data shape', () => {
    expect(() => validateIndraYogaEntries([{ date: '2026-Jan-15' }])).toThrow('IndraYog entry 1');
    expect(validateIndraYogaEntries(entries)).toBe(entries);
  });

  it('loads and validates the supplied JSON records through the data service', () => {
    const sourceRecords = indraYogaService.getData();
    expect(sourceRecords.length).toBeGreaterThan(0);
    expect(validateIndraYogaEntries(sourceRecords)).toBe(sourceRecords);
  });
});
