export type TradeType = 'BUY' | 'SELL';
export type NotificationDuration = '1M' | '2M' | '7D' | '14D' | '21D';
export type NotificationStatus = 'PENDING' | 'TRIGGERED' | 'EXPIRED' | 'DISABLED';
export type ResultStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export type NotificationInterval = 1 | 2 | 7 | 14 | 21;
export type TradeNotificationState = 'scheduled' | 'triggered' | 'read' | 'exit-saved';

export interface MarketReference {
  gannAngle?: number | string;
  pressureDate?: string;
  planet?: string;
  sector?: string;
  referenceType?: string;
}

export interface StockTrade {
  id: string;
  stock: string;
  tradeType: TradeType;
  tradeDate: string;
  tradeTime: string;
  entryPrice: number;
  quantity: number;
  targetPrice: number | null;
  stopLoss: number | null;
  notes: string;
  notification: {
    enabled: boolean;
    duration: NotificationDuration;
    notificationDateTime: string;
    status: NotificationStatus;
    intervals?: NotificationInterval[];
    events?: TradeNotification[];
  };
  review: {
    exitType: TradeType | null;
    exitPrice: number | null;
    exitDate: string | null;
  };
  result: {
    status: ResultStatus;
    profitLoss: number | null;
    profitLossPercent: number | null;
  };
  marketReference?: MarketReference;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTradeInput {
  stock: string;
  tradeType: TradeType;
  tradeDate: string;
  tradeTime: string;
  entryPrice: number | string;
  quantity: number | string;
  targetPrice?: number | string | null;
  stopLoss?: number | string | null;
  notes?: string;
  duration?: NotificationDuration;
  enabled?: boolean;
  intervals?: readonly NotificationInterval[];
  marketReference?: MarketReference;
}

export interface TradeNotification {
  id: string;
  tradeId: string;
  interval: NotificationInterval;
  scheduledAt: string;
  triggeredAt?: string;
  readAt?: string;
  status: TradeNotificationState;
  price?: number | null;
  change?: number | null;
  changePercent?: number | null;
  exitPrice?: number | null;
  capturedAt?: string;
}

export interface TradeNotificationConfigInput {
  enabled: boolean;
  intervals: NotificationInterval[];
}

export interface TradeNotificationReviewInput {
  notificationId: string;
  exitPrice: number | string;
}

export interface ReviewTradeInput {
  exitType: TradeType;
  exitPrice: number | string;
  exitDate: string;
  resultStatus: Exclude<ResultStatus, 'PENDING'>;
  notes?: string;
}
