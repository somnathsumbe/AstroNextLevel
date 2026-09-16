import { getAllStockRecords, getTodayStockRecords, generateStockRecords } from '@/lib/data/repositories/stock-client.repository';

export const stockService = {
  getAllStockRecords,
  getTodayStockRecords,
  generateStockRecords,
};