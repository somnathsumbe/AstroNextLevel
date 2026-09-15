import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { getIndiaToday, pressureDateKey } from "@/lib/date/date-utils";
import { getRecordKey } from "@/lib/gann/calculator";
import type { GannPressureRecord, GannInputStock, StockFile } from "@/lib/stocks/stock-types";

export function getStocksDirectory() { return path.join(process.cwd(), "data", "stocks"); }
export function normalizeStockName(stock: string) { return String(stock || "").trim().toUpperCase(); }
export function getStockFilePath(stock: string) {
  const normalized = normalizeStockName(stock);
  if (!/^[A-Z0-9][A-Z0-9._&-]*$/.test(normalized)) throw new Error("Invalid stock filename.");
  return path.join(getStocksDirectory(), `${normalized}.json`);
}
export async function stockExists(stock: string) { try { await fs.access(getStockFilePath(stock)); return true; } catch { return false; } }
export async function readStock(stock: string): Promise<StockFile | null> { try { return JSON.parse(await fs.readFile(getStockFilePath(stock), "utf8")) as StockFile; } catch { return null; } }
async function writeStock(stock: string, data: StockFile) { await fs.mkdir(getStocksDirectory(), { recursive: true }); await fs.writeFile(getStockFilePath(stock), `${JSON.stringify(data, null, 2)}\n`, "utf8"); }
export async function createStock(stock: string, data: StockFile) { await writeStock(stock, data); }
export async function updateStock(stock: string, data: StockFile) { await writeStock(stock, data); }

export function buildStockFile(input: GannInputStock, pressureDates: GannPressureRecord[]): StockFile {
  return { stock: normalizeStockName(input.stock), metadata: { sector: input.sector || "", planet: input.planet || "", planetIcon: input.planetIcon || "", normalDailyMovement: input.normalDailyMovement || "Not provided" }, references: { high: { date: input.referenceDateHigh || "", value: Number(input.high), type: input.referenceTypeHigh || "Major High" }, low: { date: input.referenceDateLow || "", value: input.low == null ? null : Number(input.low), type: input.referenceTypeLow || "Major Low" } }, pressureDates };
}

export async function mergeStockData(stock: string, newData: StockFile): Promise<{ data: StockFile; existed: boolean }> {
  const existing = await readStock(stock);
  const referenceTypes = new Set(newData.pressureDates.map((record) => record.ReferenceType));
  const retained = (existing?.pressureDates || []).filter((record) => !referenceTypes.has(record.ReferenceType));
  const records = new Map<string, GannPressureRecord>();
  [...retained, ...newData.pressureDates].forEach((record) => records.set(getRecordKey(record), record));
  const merged: StockFile = { ...newData, pressureDates: [...records.values()] };
  if (existing) await updateStock(stock, merged); else await createStock(stock, merged);
  return { data: merged, existed: Boolean(existing) };
}

export async function getAllStocks(): Promise<StockFile[]> {
  await fs.mkdir(getStocksDirectory(), { recursive: true });
  const names = (await fs.readdir(getStocksDirectory())).filter((name) => name.endsWith(".json"));
  return Promise.all(names.map(async (name) => JSON.parse(await fs.readFile(path.join(getStocksDirectory(), name), "utf8")) as StockFile));
}
export async function getAllStockRecords() { return (await getAllStocks()).flatMap((stock) => stock.pressureDates || []); }
export async function getTodayStockRecords() { const today = getIndiaToday(); return (await getAllStockRecords()).filter((record) => pressureDateKey(record.PressureDate) === today); }
