import { describe, expect, it } from 'vitest';
import { parseTradeFile } from '@/lib/data/repositories/trade.repository';
import { calculatePriceChange, calculateResult, createTrade, normalizeIntervals, reconcileNotifications } from '@/lib/trades/trade-utils';

const input = { stock: 'TCS', tradeType: 'BUY' as const, tradeDate: '2026-09-16', tradeTime: '10:00', entryPrice: 3500, quantity: 10, intervals: [1, 2, 7, 14, 21] as const };

describe('trade notification intervals', () => {
  it('normalizes, deduplicates, and validates supported intervals', () => {
    expect(normalizeIntervals([21, 1, 14, 1])).toEqual([1, 14, 21]);
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
    const first = reconcileNotifications(trade, new Date('2026-09-16T04:32:00.000Z'));
    expect(first.notification.events?.map((event) => [event.interval, event.status])).toEqual([[1, 'triggered'], [2, 'triggered'], [7, 'scheduled'], [14, 'scheduled'], [21, 'scheduled']]);
    const second = reconcileNotifications(first, new Date('2026-09-16T04:32:30.000Z'));
    expect(second.notification.events?.map((event) => event.id)).toEqual(first.notification.events?.map((event) => event.id));
  });

  it('keeps later intervals scheduled until their own completion time', () => {
    const trade = { ...createTrade(input, new Date('2026-09-16T04:30:00.000Z')), id: 'TRD-TEST-3' };
    const afterSevenDays = reconcileNotifications(trade, new Date('2026-09-23T04:31:00.000Z'));

    expect(afterSevenDays.notification.events?.map((event) => [event.interval, event.status])).toEqual([[1, 'triggered'], [2, 'triggered'], [7, 'triggered'], [14, 'scheduled'], [21, 'scheduled']]);
  });

  it('automatically disables the dashboard notification after all intervals finish', () => {
    const trade = { ...createTrade(input, new Date('2026-09-16T04:30:00.000Z')), id: 'TRD-TEST-2' };
    const complete = reconcileNotifications(trade, new Date('2026-10-08T04:36:00.000Z'));

    expect(complete.notification.enabled).toBe(false);
    expect(complete.notification.status).toBe('DISABLED');
    expect(complete.notification.events?.every((event) => event.status === 'triggered')).toBe(true);
  });

  it('recovers valid trade data when a trailing corrupted fragment is appended', () => {
    const validTrade = { id: 'TRD-RECOVER-1', stock: 'BALKRISIND', tradeType: 'BUY', tradeDate: '2026-09-17', tradeTime: '14:00', entryPrice: 100, quantity: 10, targetPrice: 120, stopLoss: 90, notes: 'Recovered', notification: { enabled: true, duration: '7D', notificationDateTime: '2026-09-24T14:00:00+05:30', status: 'PENDING', intervals: [7], events: [] }, review: { exitType: null, exitPrice: null, exitDate: null }, result: { status: 'PENDING', profitLoss: null, profitLossPercent: null }, createdAt: '2026-09-17T14:00:00+05:30', updatedAt: '2026-09-17T14:00:00+05:30' };
    const malformed = `${JSON.stringify([validTrade], null, 2)}\n]\n"Date": "17 Sept 2026"\n`;

    expect(parseTradeFile(malformed)).toEqual([validTrade]);
  });
});