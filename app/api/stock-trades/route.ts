import { NextResponse } from 'next/server';
import { createStockTrade, listTrades } from '@/lib/data/services/trade.service';
import type { CreateTradeInput } from '@/lib/trades/trade-types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' };

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: await listTrades() }, { headers });
  } catch {
    return NextResponse.json({ success: false, error: { code: 'STORAGE_ERROR', message: 'Unable to load stock trades.' } }, { status: 500, headers });
  }
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as CreateTradeInput;
    const trade = await createStockTrade(input);
    return NextResponse.json({ success: true, data: trade }, { status: 201, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid trade request.';
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message } }, { status: 400, headers });
  }
}
