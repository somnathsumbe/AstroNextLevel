import { describe, expect, it } from 'vitest';
import { calculatePressureDates, getRecordKey, getReference } from '@/lib/gann/calculator';
import type { GannInputStock } from '@/lib/stocks/stock-types';

const stock: GannInputStock = {
  stock: ' abb ',
  referenceDateHigh: '15/08/2024',
  high: 1234.5,
  referenceDateLow: '10/08/2024',
  low: 1200,
  referenceTypeHigh: 'Major High',
  referenceTypeLow: 'Major Low',
  sector: 'Industrial',
  planet: 'Mars',
  normalDailyMovement: '1.2% ',
};

describe('Gann calculator', () => {
  it('selects the requested high or low reference without changing the input', () => {
    expect(getReference(stock, 'Major High')).toMatchObject({ date: '15/08/2024', value: 1234.5, type: 'Major High' });
    expect(getReference(stock, 'Major Low')).toMatchObject({ date: '10/08/2024', value: 1200, type: 'Major Low' });
    expect(stock.stock).toBe(' abb ');
  });

  it('generates one deterministic record for every configured angle', () => {
    const records = calculatePressureDates(stock, 'Major High', '09:15');

    expect(records).toHaveLength(14);
    expect(records.map((record) => record.Angle)).toEqual([30, 45, 60, 90, 120, 135, 144, 180, 216, 225, 240, 270, 315, 360]);
    expect(records.filter((record) => record.Priority === 'HIGH')).toHaveLength(8);
    expect(records[0]).toMatchObject({ Stock: 'ABB', ReferenceDate: '15/08/2024', ReferenceValue: 1234.5, IndiaTime: '09:15' });
    expect(records.every((record) => record.PressureDate && record.Day)).toBe(true);
  });

  it('returns no records for an invalid reference date', () => {
    expect(calculatePressureDates({ ...stock, referenceDateHigh: '31/02/2024' })).toEqual([]);
  });

  it('creates stable merge keys from the identifying record fields', () => {
    const record = calculatePressureDates(stock)[0];
    expect(getRecordKey(record)).toBe('ABB|Major High|15/08/2024|1234.5|30|09:15');
  });
});
