import {
  ANGLES,
  IMPORTANT_ANGLES,
  normalizeStockData,
  readStockData,
  saveStockData,
  STOCK_DATA,
  STOCK_DATA_VERSION,
} from '@/app/stocks-times/stockMaster';

export function getStockMasterData() {
  return normalizeStockData(STOCK_DATA);
}

export function normalizeStockMasterData(stocks) {
  return normalizeStockData(stocks);
}

export function readStockMasterData() {
  return readStockData();
}

export function saveStockMasterData(stocks) {
  saveStockData(stocks);
  return stocks;
}

export function getStockCalculationConfig() {
  return { angles: ANGLES, importantAngles: IMPORTANT_ANGLES, version: STOCK_DATA_VERSION };
}