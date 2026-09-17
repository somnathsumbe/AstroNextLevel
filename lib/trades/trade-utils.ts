import type { CreateTradeInput, NotificationInterval, ReviewTradeInput, StockTrade, TradeNotification, TradeNotificationConfigInput, TradeNotificationReviewInput } from '@/lib/trades/trade-types';

export const TRADE_DURATIONS = {
  '7D': 7,
  '14D': 14,
} as const;

const IST_OFFSET_MINUTES = 330;
export const NOTIFICATION_INTERVALS: NotificationInterval[] = [7, 14];

export function normalizeIntervals(values: unknown, fallback: NotificationInterval[] = [7]) {
  const intervals = Array.isArray(values)
    ? values.map(Number).filter((value): value is NotificationInterval => NOTIFICATION_INTERVALS.includes(value as NotificationInterval))
    : [];
  return [...new Set(intervals)].sort((left, right) => left - right).length ? [...new Set(intervals)].sort((left, right) => left - right) : fallback;
}

function toNumber(value: unknown, field: string, required = true) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new Error(`${field} is required.`);
    return null;
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${field} must be a positive number.`);
  return number;
}

function parseLocalDateTime(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}(:\d{2})?$/.test(time)) throw new Error('Trade date and time are invalid.');
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute, second] = normalizedTime.split(':').map(Number);
  const check = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day || hour > 23 || minute > 59 || second > 59) throw new Error('Trade date and time are invalid.');
  return new Date(check.getTime() - IST_OFFSET_MINUTES * 60_000);
}

export function formatIndiaDateTime(date = new Date()) {
  const shifted = new Date(date.getTime() + IST_OFFSET_MINUTES * 60_000);
  return shifted.toISOString().replace('Z', '+05:30');
}

export function notificationDateTime(tradeDate: string, tradeTime: string, duration: keyof typeof TRADE_DURATIONS) {
  const date = parseLocalDateTime(tradeDate, tradeTime);
  const days = TRADE_DURATIONS[duration];
  if (!days) throw new Error('Notification duration is invalid.');
  return formatIndiaDateTime(new Date(date.getTime() + days * 24 * 60 * 60_000));
}

export function calculateResult(trade: Pick<StockTrade, 'tradeType' | 'entryPrice' | 'quantity'>, exitPrice: number) {
  const profitLoss = trade.tradeType === 'BUY'
    ? (exitPrice - trade.entryPrice) * trade.quantity
    : (trade.entryPrice - exitPrice) * trade.quantity;
  const profitLossPercent = trade.entryPrice ? (profitLoss / (trade.entryPrice * trade.quantity)) * 100 : 0;
  return { profitLoss: Number(profitLoss.toFixed(2)), profitLossPercent: Number(profitLossPercent.toFixed(2)) };
}

export function calculatePriceChange(entryPrice: number, price: number | null | undefined) {
  if (!Number.isFinite(price) || !entryPrice) return { change: null, changePercent: null };
  const change = Number((Number(price) - entryPrice).toFixed(2));
  return { change, changePercent: Number(((change / entryPrice) * 100).toFixed(2)) };
}

function tradeStartTime(trade: Pick<StockTrade, 'tradeDate' | 'tradeTime'>) {
  return parseLocalDateTime(trade.tradeDate, trade.tradeTime);
}

function eventFor(trade: StockTrade, interval: NotificationInterval, now: Date): TradeNotification {
  const scheduledAt = formatIndiaDateTime(new Date(tradeStartTime(trade).getTime() + interval * 24 * 60 * 60_000));
  const existing = trade.notification.events?.find((event) => event.id === `${trade.id}-${interval}`);
  return existing || { id: `${trade.id}-${interval}`, tradeId: trade.id, interval, scheduledAt, status: 'scheduled' };
}

export function notificationIntervals(trade: StockTrade) {
  return normalizeIntervals(trade.notification.intervals, [7]);
}

export function reconcileNotifications(trade: StockTrade, now = new Date()): StockTrade {
  const intervals = notificationIntervals(trade).filter((interval) => NOTIFICATION_INTERVALS.includes(interval));
  const events: TradeNotification[] = intervals.map((interval) => {
    const event = eventFor(trade, interval, now);
    if (event.status === 'scheduled' && new Date(event.scheduledAt).getTime() <= now.getTime()) return { ...event, status: 'triggered' as const, triggeredAt: event.triggeredAt || formatIndiaDateTime(now) };
    return event;
  });
  const durationComplete = events.length > 0 && events.every((event) => event.status !== 'scheduled');
  const enabled = trade.notification.enabled && !durationComplete;
  return { ...trade, notification: { ...trade.notification, enabled, intervals, events, status: enabled && events.some((event) => event.status === 'triggered') ? 'TRIGGERED' : enabled ? 'PENDING' : 'DISABLED' } };
}

export function configureNotifications(trade: StockTrade, input: TradeNotificationConfigInput, now = new Date()) {
  const intervals = normalizeIntervals(input.intervals, []);
  if (input.enabled && !intervals.length) throw new Error('Select at least one notification interval.');
  const next: StockTrade = { ...trade, notification: { ...trade.notification, enabled: input.enabled, intervals, duration: intervals.includes(14) ? '14D' : '7D', status: input.enabled ? 'PENDING' : 'DISABLED', events: input.enabled ? intervals.map((interval) => eventFor({ ...trade, notification: { ...trade.notification, intervals } }, interval, now)) : trade.notification.events || [] }, updatedAt: formatIndiaDateTime(now) };
  return reconcileNotifications(next, now);
}

export function saveNotificationExit(trade: StockTrade, input: TradeNotificationReviewInput, now = new Date()) {
  const exitPrice = toNumber(input.exitPrice, 'Exit price');
  const events = (trade.notification.events || []).map((event) => event.id === input.notificationId ? { ...event, status: 'exit-saved' as const, readAt: event.readAt || formatIndiaDateTime(now), exitPrice, capturedAt: event.capturedAt || formatIndiaDateTime(now), ...calculatePriceChange(trade.entryPrice, exitPrice) } : event);
  return { ...trade, notification: { ...trade.notification, events }, updatedAt: formatIndiaDateTime(now) };
}

export function markNotificationRead(trade: StockTrade, notificationId: string, now = new Date()) {
  const events = (trade.notification.events || []).map((event) => event.id === notificationId && event.status === 'triggered' ? { ...event, status: 'read' as const, readAt: formatIndiaDateTime(now) } : event);
  return { ...trade, notification: { ...trade.notification, events }, updatedAt: formatIndiaDateTime(now) };
}

export function createTrade(input: CreateTradeInput, now = new Date()): StockTrade {
  const stock = String(input.stock || '').trim().toUpperCase();
  if (!stock || !/^[A-Z0-9._&-]+$/.test(stock)) throw new Error('Stock is required and invalid.');
  if (input.tradeType !== 'BUY' && input.tradeType !== 'SELL') throw new Error('Trade type is invalid.');
  const entryPrice = toNumber(input.entryPrice, 'Entry price');
  const quantity = toNumber(input.quantity, 'Quantity');
  const targetPrice = toNumber(input.targetPrice, 'Target price', false);
  const stopLoss = toNumber(input.stopLoss, 'Stop loss', false);
  const duration = input.duration || '7D';
  const notificationEnabled = input.enabled !== false;
  if (input.intervals && !normalizeIntervals(input.intervals, []).length && notificationEnabled) throw new Error('Select at least one notification interval.');
  const intervals = normalizeIntervals(input.intervals, duration === '14D' ? [14] : [7]);
  const createdAt = formatIndiaDateTime(now);
  return {
    id: '',
    stock,
    tradeType: input.tradeType,
    tradeDate: input.tradeDate,
    tradeTime: input.tradeTime.length === 5 ? `${input.tradeTime}:00` : input.tradeTime,
    entryPrice,
    quantity,
    targetPrice,
    stopLoss,
    notes: String(input.notes || '').slice(0, 1000),
    notification: {
      enabled: notificationEnabled,
      duration,
      notificationDateTime: notificationEnabled ? notificationDateTime(input.tradeDate, input.tradeTime, duration) : createdAt,
      status: notificationEnabled ? 'PENDING' : 'DISABLED',
      intervals,
      events: [],
    },
    review: { exitType: null, exitPrice: null, exitDate: null },
    result: { status: 'PENDING', profitLoss: null, profitLossPercent: null },
    marketReference: input.marketReference,
    createdAt,
    updatedAt: createdAt,
  };
}

export function applyReview(trade: StockTrade, input: ReviewTradeInput, now = new Date()): StockTrade {
  const exitPrice = toNumber(input.exitPrice, 'Exit price');
  if (input.exitType !== 'BUY' && input.exitType !== 'SELL') throw new Error('Exit type is invalid.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.exitDate)) throw new Error('Exit date is invalid.');
  const result = calculateResult(trade, exitPrice);
  return {
    ...trade,
    notes: String(input.notes ?? trade.notes).slice(0, 1000),
    review: { exitType: input.exitType, exitPrice, exitDate: input.exitDate },
    result: { status: input.resultStatus, ...result },
    updatedAt: formatIndiaDateTime(now),
  };
}

export function updateDueStatus(trade: StockTrade, now = new Date()): StockTrade {
  if (trade.notification.status !== 'PENDING' || !trade.notification.enabled) return trade;
  const due = new Date(trade.notification.notificationDateTime).getTime() <= now.getTime();
  return due ? { ...trade, notification: { ...trade.notification, status: 'TRIGGERED' }, updatedAt: formatIndiaDateTime(now) } : trade;
}
