export interface Stock {
  symbol: string;
  name: string;
}

export type RawStock = Stock | [string, string];

export interface Planet {
  icon: string;
  sectors: Record<string, RawStock[]>;
}

export interface PlanetStockMappingDataset {
  year: number;
  planets: Record<string, Planet>;
}

export interface SelectedStock {
  symbol: string;
  name: string;
  planet: string;
  sector: string;
}
