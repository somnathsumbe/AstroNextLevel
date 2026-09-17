import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { StockTrade } from '@/lib/trades/trade-types';

const filePath = path.join(process.cwd(), 'data', 'stock-trades.json');

async function ensureFile() {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, '[]\n', 'utf8');
  }
}

async function readTrades(): Promise<StockTrade[]> {
  await ensureFile();
  const parsed = JSON.parse(await fs.readFile(filePath, 'utf8'));
  if (!Array.isArray(parsed)) throw new Error('Trade data is invalid.');
  return parsed as StockTrade[];
}

async function writeTrades(trades: StockTrade[]) {
  await fs.writeFile(filePath, `${JSON.stringify(trades, null, 2)}\n`, 'utf8');
}

export async function getTrades() {
  return readTrades();
}

export async function getTrade(id: string) {
  return (await readTrades()).find((trade) => trade.id === id) || null;
}

export async function appendTrade(trade: StockTrade) {
  const trades = await readTrades();
  trades.push(trade);
  await writeTrades(trades);
  return trade;
}

export async function replaceTrade(trade: StockTrade) {
  const trades = await readTrades();
  const index = trades.findIndex((item) => item.id === trade.id);
  if (index < 0) return null;
  trades[index] = trade;
  await writeTrades(trades);
  return trade;
}

export async function removeTrade(id: string) {
  const trades = await readTrades();
  const next = trades.filter((trade) => trade.id !== id);
  if (next.length === trades.length) return false;
  await writeTrades(next);
  return true;
}
