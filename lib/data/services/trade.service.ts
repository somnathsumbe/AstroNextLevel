import { appendTrade, getTrade, getTrades, removeTrade, replaceTrade } from '@/lib/data/repositories/trade.repository';
import { applyReview, configureNotifications, createTrade, markNotificationRead, reconcileNotifications, saveNotificationExit } from '@/lib/trades/trade-utils';
import type { CreateTradeInput, ReviewTradeInput, StockTrade, TradeNotificationConfigInput, TradeNotificationReviewInput } from '@/lib/trades/trade-types';

function tradeId(now = new Date()) {
  const stamp = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now).replace(/[-:]/g, '').replace(',', '-');
  return `TRD-${stamp}-${Math.floor(Math.random() * 10_000).toString().padStart(4, '0')}`;
}

async function refreshDueTrades(trades: StockTrade[]) {
  const updated = trades.map((trade) => reconcileNotifications(trade));
  await Promise.all(updated.map((trade, index) => trade !== trades[index] ? replaceTrade(trade) : Promise.resolve(trade)));
  return updated;
}

export async function listTrades() {
  return refreshDueTrades(await getTrades());
}

export async function findTrade(id: string) {
  const trade = await getTrade(id);
  if (!trade) return null;
  const updated = reconcileNotifications(trade);
  if (updated !== trade) await replaceTrade(updated);
  return updated;
}

export async function createStockTrade(input: CreateTradeInput) {
  const trade = createTrade(input);
  trade.id = tradeId();
  return appendTrade(trade);
}

export async function reviewStockTrade(id: string, input: ReviewTradeInput) {
  const trade = await findTrade(id);
  if (!trade) return null;
  return replaceTrade(applyReview(trade, input));
}

export async function configureStockTradeNotifications(id: string, input: TradeNotificationConfigInput) {
  const trade = await findTrade(id);
  if (!trade) return null;
  return replaceTrade(configureNotifications(trade, input));
}

export async function readStockTradeNotification(id: string, notificationId: string) {
  const trade = await findTrade(id);
  if (!trade) return null;
  return replaceTrade(markNotificationRead(trade, notificationId));
}

export async function saveStockTradeNotificationExit(id: string, input: TradeNotificationReviewInput) {
  const trade = await findTrade(id);
  if (!trade) return null;
  return replaceTrade(saveNotificationExit(trade, input));
}

export async function deleteStockTrade(id: string) {
  return removeTrade(id);
}
