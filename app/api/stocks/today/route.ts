import { NextResponse } from "next/server";
import { formatIndianDate, getIndiaToday, pressureDateKey } from "@/lib/date/date-utils";
import { getAllStockRecords } from "@/lib/stocks/stock-storage";
import type { TodayStockResponse } from "@/lib/stocks/stock-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const all = url.searchParams.get("all") === "1";
    const today = getIndiaToday();
    const records = await getAllStockRecords();
    const data = all ? records : records.filter((record) => pressureDateKey(record.PressureDate) === today);
    data.sort((left, right) => Number(right.Priority === "HIGH") - Number(left.Priority === "HIGH") || left.IndiaTime.localeCompare(right.IndiaTime) || left.Angle - right.Angle || left.Stock.localeCompare(right.Stock));
    const response: TodayStockResponse = { success: true, date: formatIndianDate(new Date(`${today}T00:00:00Z`)), total: data.length, data };
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ success: false, error: { code: "STORAGE_ERROR", message: "Unable to load stock pressure data." } }, { status: 500 });
  }
}
