import type { GannInputStock, ValidationIssue } from "@/lib/stocks/stock-types";
import { parseIndianDate } from "@/lib/date/date-utils";

export function validateStock(value: unknown): { stock?: GannInputStock; issue?: ValidationIssue } {
  if (!value || typeof value !== "object") return { issue: { message: "Stock must be an object." } };
  const input = value as GannInputStock;
  const name = String(input.stock || "").trim().toUpperCase();
  if (!name) return { issue: { message: "Missing stock name." } };
  if (!/^[A-Z0-9][A-Z0-9._&-]*$/.test(name)) return { issue: { stock: name, message: "Invalid stock filename characters." } };
  if (!String(input.referenceDateHigh || "").trim() || input.high === undefined || input.high === null || input.high === "" || !Number.isFinite(Number(input.high))) return { issue: { stock: name, message: "Valid referenceDateHigh and numeric high are required." } };
  if (!parseIndianDate(String(input.referenceDateHigh))) return { issue: { stock: name, message: "Invalid referenceDateHigh." } };
  if (input.referenceDateLow && input.referenceDateLow !== "VERIFY_REQUIRED" && !parseIndianDate(String(input.referenceDateLow))) return { issue: { stock: name, message: "Invalid referenceDateLow." } };
  const normalized: GannInputStock = { ...input, stock: name, high: Number(input.high), low: input.low === undefined || input.low === "" || input.low === null ? null : Number(input.low), sector: String(input.sector || ""), planet: String(input.planet || ""), planetIcon: String(input.planetIcon || ""), normalDailyMovement: String(input.normalDailyMovement || "Not provided") };
  if (normalized.low !== null && !Number.isFinite(normalized.low)) return { issue: { stock: name, message: "Low must be numeric." } };
  return { stock: normalized };
}
