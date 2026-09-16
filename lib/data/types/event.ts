export type AstrologyEventPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface AstrologyEvent {
  id: string;
  type: string;
  title: string;
  shortTitle: string;
  eventDate: string;
  displayDate: string;
  description: string;
  sourcePage: string;
  route: string;
  icon: string;
  priority: AstrologyEventPriority;
  startTime?: string;
  endTime?: string;
  degree?: number;
  actualDegree?: number;
  marketStatus?: string;
}