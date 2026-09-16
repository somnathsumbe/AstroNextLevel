import {
  getStockCalculationConfig,
  getStockMasterData,
  normalizeStockMasterData,
  readStockMasterData,
  saveStockMasterData,
} from '@/lib/data/repositories/stock-master.repository';

export const stockMasterService = {
  getStockMasterData,
  normalizeStockMasterData,
  readStockMasterData,
  saveStockMasterData,
  getStockCalculationConfig,
  searchStocks(stocks, query) {
    const normalizedQuery = String(query || '').trim().toLowerCase();
    if (!normalizedQuery) return stocks;
    return stocks.filter((stock) => `${stock.stock} ${stock.sector}`.toLowerCase().includes(normalizedQuery));
  },
  getSectors(stocks) {
    return [...new Set(stocks.map((stock) => stock.sector).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  },
};