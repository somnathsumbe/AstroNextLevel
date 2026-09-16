export interface StockMasterRecord {
  stock: string;
  referenceDateHigh: string;
  high: number | string | null;
  referenceTypeHigh: string;
  referenceDateLow: string;
  low: number | string | null;
  referenceTypeLow: string;
  sector: string;
  planet?: string;
  planetIcon?: string;
  normalDailyMovement?: string;
}

export type StockMasterInput = Omit<StockMasterRecord, 'stock' | 'sector'> & {
  stock: string;
  sector: string;
};

export type {
  GannInputStock,
  GannPressureRecord,
  GenerateResponse,
  StockFile,
  StockMetadata,
  StockReference,
  TodayStockResponse,
} from '@/lib/stocks/stock-types';