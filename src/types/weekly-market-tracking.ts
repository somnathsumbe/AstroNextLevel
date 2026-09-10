export interface MarketEvent {
  targetDegree: number;
  crossingDate: string;
  day: string;
  observationTime: string;
  observedDegree: number;
}

export interface MarketYear {
  year: number;
  events: MarketEvent[];
}

export interface MarketRecord extends MarketEvent {
  year: number;
  dateLabel: string;
  month: string;
  weekend: boolean;
  id: string;
}
