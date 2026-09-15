import { NextResponse } from "next/server";
import { calculatePressureDates } from "@/lib/gann/calculator";
import { validateStock } from "@/lib/gann/validators";
import { buildStockFile, mergeStockData } from "@/lib/stocks/stock-storage";
import { DEFAULT_INDIA_TIME } from "@/lib/gann/constants";
import type { GenerateResponse, GannInputStock } from "@/lib/stocks/stock-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const stocks = Array.isArray(body) ? body : body?.stocks;
    if (!Array.isArray(stocks) || !stocks.length) return NextResponse.json<GenerateResponse>({ success: false, error: { code: "VALIDATION_ERROR", message: "JSON must contain at least one stock object." } }, { status: 400 });
    const referenceType = body?.referenceType || "Major High";
    const referenceTime = body?.referenceTime || DEFAULT_INDIA_TIME;
    const errors = [];
    const validStocks: GannInputStock[] = [];
    for (const candidate of stocks) {
      const result = validateStock(candidate);
      if (result.stock) validStocks.push(result.stock); else if (result.issue) errors.push(result.issue);
    }
    const uniqueStocks = new Map(validStocks.map((stock) => [stock.stock, stock]));
    let newFilesCreated = 0;
    let existingFilesUpdated = 0;
    let recordsGenerated = 0;
    let highPriority = 0;
    const data = [];
    for (const stock of uniqueStocks.values()) {
      const records = calculatePressureDates(stock, referenceType, referenceTime);
      if (!records.length) {
        errors.push({ stock: stock.stock, message: `No valid ${referenceType} reference date available.` });
        continue;
      }
      const result = await mergeStockData(stock.stock, buildStockFile(stock, records));
      if (result.existed) existingFilesUpdated += 1; else newFilesCreated += 1;
      recordsGenerated += records.length;
      highPriority += records.filter((record) => record.Priority === "HIGH").length;
      data.push(...records);
    }
    const response: GenerateResponse = { success: true, summary: { stocksReceived: stocks.length, validStocks: uniqueStocks.size, invalidStocks: errors.length, newFilesCreated, existingFilesUpdated, recordsGenerated, highPriority, secondary: recordsGenerated - highPriority }, errors, data };
    return NextResponse.json(response);
  } catch {
    return NextResponse.json<GenerateResponse>({ success: false, error: { code: "INVALID_REQUEST", message: "Unable to process the stock data." } }, { status: 400 });
  }
}
