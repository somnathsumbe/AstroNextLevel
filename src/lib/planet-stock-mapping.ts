import type { Planet, RawStock, Stock } from '@/src/types/planet-stock-mapping';

export function normalizeStock(value: RawStock): Stock {
  return Array.isArray(value) ? { symbol: value[0], name: value[1] } : value;
}

export function normalizeSectors(planet: Planet): Record<string, Stock[]> {
  return Object.fromEntries(Object.entries(planet.sectors).map(([sector, stocks]) => [sector, stocks.map(normalizeStock)]));
}

export function formatSectorName(value: string): string {
  return value.replace(/_/g, ' ');
}

export function stockKey(planet: string, symbol: string): string {
  return `${planet}:${symbol}`;
}

export function uniqueStockCount(sectors: Record<string, Stock[]>): number {
  return new Set(Object.values(sectors).flat().map((stock) => stock.symbol)).size;
}
