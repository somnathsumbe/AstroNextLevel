export interface SunJupiterEvent {
  date: string;
  day: string;
  timeIST: string;
  angle: number;
  aspect: string;
}

export interface SunJupiterData {
  planetPair: string;
  coordinateSystem: string;
  angleCalculation: string;
  timezone: string;
  period: string;
  targetAngles: number[];
  aspects: Record<string, string>;
  events: SunJupiterEvent[];
}

export interface SunJupiterRecord extends SunJupiterEvent {
  id: string;
  year: number;
  dateLabel: string;
  testDate: string;
  testDateLabel: string;
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
  month: string;
  weekend: boolean;
}
