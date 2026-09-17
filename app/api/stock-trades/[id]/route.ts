import { NextResponse } from 'next/server';
import { configureStockTradeNotifications, deleteStockTrade, findTrade, readStockTradeNotification, reviewStockTrade, saveStockTradeNotificationExit } from '@/lib/data/services/trade.service';
import type { ReviewTradeInput, TradeNotificationConfigInput, TradeNotificationReviewInput } from '@/lib/trades/trade-types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trade = await findTrade(id);
  if (!trade) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Trade not found.' } }, { status: 404, headers });
  return NextResponse.json({ success: true, data: trade }, { headers });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as { action?: string; notificationId?: string; } & Partial<ReviewTradeInput & TradeNotificationConfigInput & TradeNotificationReviewInput>;
    const trade = body.action === 'configure'
      ? await configureStockTradeNotifications(id, { enabled: Boolean(body.enabled), intervals: body.intervals || [] } as TradeNotificationConfigInput)
      : body.action === 'read'
        ? await readStockTradeNotification(id, body.notificationId || '')
        : body.action === 'exit'
          ? await saveStockTradeNotificationExit(id, { notificationId: body.notificationId || '', exitPrice: body.exitPrice || '' })
          : await reviewStockTrade(id, body as ReviewTradeInput);
    if (!trade) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Trade not found.' } }, { status: 404, headers });
    return NextResponse.json({ success: true, data: trade }, { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid review request.';
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message } }, { status: 400, headers });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await deleteStockTrade(id))) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Trade not found.' } }, { status: 404, headers });
  return new Response(null, { status: 204, headers });
}
