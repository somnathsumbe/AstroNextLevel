export type ReferenceType = "Major High" | "Major Low" | string;

export interface GannInputStock {
  stock: string;
  referenceDateHigh?: string;
  high?: number | string | null;
  referenceTypeHigh?: string;
  referenceDateLow?: string;
  low?: number | string | null;
  referenceTypeLow?: string;
  sector?: string;
  planet?: string;
  planetIcon?: string;
  normalDailyMovement?: string;
}

export interface StockMetadata {
  sector: string;
  planet: string;
  planetIcon: string;
  normalDailyMovement: string;
}

export interface StockReference {
  date: string;
  value: number | null;
  type: ReferenceType;
}

export interface GannPressureRecord {
  Stock: string;
  PressureDate: string;
  Day: string;
  Priority: "HIGH" | "SECONDARY";
  Angle: number;
  IndiaTime: string;
  Planet: string;
  PlanetIcon: string;
  Sector: string;
  ReferenceValue: number | null;
  ReferenceDate: string;
  ReferenceType: string;
  Movement: string;
  LowDate: string;
  Low: number | null;
}

export interface StockFile {
  stock: string;
  metadata: StockMetadata;
  references: { high: StockReference; low: StockReference };
  pressureDates: GannPressureRecord[];
}

export interface ValidationIssue {
  stock?: string;
  message: string;
}

export interface GenerateSummary {
  stocksReceived: number;
  validStocks: number;
  invalidStocks: number;
  newFilesCreated: number;
  existingFilesUpdated: number;
  recordsGenerated: number;
  highPriority: number;
  secondary: number;
}

export interface GenerateResponse {
  success: boolean;
  summary?: GenerateSummary;
  errors?: ValidationIssue[];
  data?: GannPressureRecord[];
  error?: { code: string; message: string };
}

export interface TodayStockResponse {
  success: boolean;
  date: string;
  total: number;
  data: GannPressureRecord[];
}
