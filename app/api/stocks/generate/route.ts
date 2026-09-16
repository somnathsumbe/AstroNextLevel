import { NextResponse } from "next/server";
import { calculatePressureDates } from "@/lib/gann/calculator";
import { validateStock } from "@/lib/gann/validators";
import { buildStockFile, mergeStockData } from "@/lib/data/repositories/stock.repository";
import { DEFAULT_INDIA_TIME } from "@/lib/gann/constants";
import type { GenerateResponse, GannInputStock } from "@/lib/stocks/stock-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 1_000_000;
const MAX_STOCKS_PER_REQUEST = 100;
const JSON_HEADERS = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_REQUEST_BYTES) return NextResponse.json<GenerateResponse>({ success: false, error: { code: "REQUEST_TOO_LARGE", message: "Request body is too large." } }, { status: 413, headers: JSON_HEADERS });
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) return NextResponse.json<GenerateResponse>({ success: false, error: { code: "REQUEST_TOO_LARGE", message: "Request body is too large." } }, { status: 413, headers: JSON_HEADERS });
    const body = JSON.parse(rawBody);
    const stocks = Array.isArray(body) ? body : body?.stocks;
    if (!Array.isArray(stocks) || !stocks.length) return NextResponse.json<GenerateResponse>({ success: false, error: { code: "VALIDATION_ERROR", message: "JSON must contain at least one stock object." } }, { status: 400, headers: JSON_HEADERS });
    if (stocks.length > MAX_STOCKS_PER_REQUEST) return NextResponse.json<GenerateResponse>({ success: false, error: { code: "VALIDATION_ERROR", message: `A maximum of ${MAX_STOCKS_PER_REQUEST} stocks may be processed per request.` } }, { status: 400, headers: JSON_HEADERS });
    const referenceType = String(body?.referenceType || "Major High").trim().slice(0, 50);
    const referenceTime = String(body?.referenceTime || DEFAULT_INDIA_TIME).trim();
    const [hours, minutes] = referenceTime.split(":").map(Number);
    if (!/^\d{2}:\d{2}$/.test(referenceTime) || hours > 23 || minutes > 59) return NextResponse.json<GenerateResponse>({ success: false, error: { code: "VALIDATION_ERROR", message: "Reference time must use HH:MM format." } }, { status: 400, headers: JSON_HEADERS });
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
    return NextResponse.json(response, { headers: JSON_HEADERS });
  } catch {
    return NextResponse.json<GenerateResponse>({ success: false, error: { code: "INVALID_REQUEST", message: "Unable to process the stock data." } }, { status: 400, headers: JSON_HEADERS });
  }
}
