import { describe, expect, it } from 'vitest';
import { calculatePriceChange, calculateResult, createTrade, normalizeIntervals, reconcileNotifications } from '@/lib/trades/trade-utils';

const input = { stock: 'TCS', tradeType: 'BUY' as const, tradeDate: '2026-09-16', tradeTime: '10:00', entryPrice: 3500, quantity: 10, intervals: [7, 14] as const };

describe('trade notification intervals', () => {
  it('normalizes, deduplicates, and validates supported intervals', () => {
    expect(normalizeIntervals([14, 7, 14])).toEqual([7, 14]);
    expect(normalizeIntervals([5, 0], [])).toEqual([]);
  });

  it('calculates price movement from entry price', () => {
    expect(calculatePriceChange(3500, 3512)).toEqual({ change: 12, changePercent: 0.34 });
    expect(calculatePriceChange(3500, null)).toEqual({ change: null, changePercent: null });
  });

  it('calculates BUY and SELL result values', () => {
    const buy = createTrade(input, new Date('2026-09-16T04:30:00.000Z'));
    expect(calculateResult(buy, 3510)).toEqual({ profitLoss: 100, profitLossPercent: 0.29 });
    expect(calculateResult({ ...buy, tradeType: 'SELL' }, 3490)).toEqual({ profitLoss: 100, profitLossPercent: 0.29 });
  });

  it('reconciles each selected interval once when due', () => {
    const trade = { ...createTrade(input, new Date('2026-09-16T04:30:00.000Z')), id: 'TRD-TEST-1' };
    const first = reconcileNotifications(trade, new Date('2026-09-23T04:32:00.000Z'));
    expect(first.notification.events?.map((event) => [event.interval, event.status])).toEqual([[7, 'triggered'], [14, 'scheduled']]);
    const second = reconcileNotifications(first, new Date('2026-09-23T04:32:30.000Z'));
    expect(second.notification.events?.map((event) => event.id)).toEqual(first.notification.events?.map((event) => event.id));
  });

  it('keeps later intervals scheduled until their own completion time', () => {
    const trade = { ...createTrade(input, new Date('2026-09-16T04:30:00.000Z')), id: 'TRD-TEST-3' };
    const afterSevenDays = reconcileNotifications(trade, new Date('2026-09-23T04:31:00.000Z'));

    expect(afterSevenDays.notification.events?.map((event) => [event.interval, event.status])).toEqual([[7, 'triggered'], [14, 'scheduled']]);
  });

  it('automatically disables the dashboard notification after all intervals finish', () => {
    const trade = { ...createTrade(input, new Date('2026-09-16T04:30:00.000Z')), id: 'TRD-TEST-2' };
    const complete = reconcileNotifications(trade, new Date('2026-09-30T04:36:00.000Z'));

    expect(complete.notification.enabled).toBe(false);
    expect(complete.notification.status).toBe('DISABLED');
    expect(complete.notification.events?.every((event) => event.status === 'triggered')).toBe(true);
  });
});