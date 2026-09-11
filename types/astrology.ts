export interface Pada {
  pada: number;
  alphabet: string;
  transliteration: string;
}

export interface Nakshatra {
  name: string;
  nameMarathi: string;
  padas: Pada[];
}

export interface Rashi {
  rashiNo: number;
  rashi: string;
  rashiMarathi: string;
  english: string;
  symbol: string;
  startDegree: number;
  endDegree: number;
  nakshatras: Nakshatra[];
}
