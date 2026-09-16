import type { GannInputStock, ValidationIssue } from "@/lib/stocks/stock-types";
import { parseIndianDate } from "@/lib/date/date-utils";

export function validateStock(value: unknown): { stock?: GannInputStock; issue?: ValidationIssue } {
  if (!value || typeof value !== "object") return { issue: { message: "Stock must be an object." } };
  const input = value as GannInputStock;
  const name = String(input.stock || "").trim().toUpperCase();
  if (!name) return { issue: { message: "Missing stock name." } };
  if (name.length > 80) return { issue: { stock: name.slice(0, 80), message: "Stock name is too long." } };
  if (!/^[A-Z0-9][A-Z0-9._&-]*$/.test(name)) return { issue: { stock: name, message: "Invalid stock filename characters." } };
  if (!String(input.referenceDateHigh || "").trim() || input.high === undefined || input.high === null || input.high === "" || !Number.isFinite(Number(input.high))) return { issue: { stock: name, message: "Valid referenceDateHigh and numeric high are required." } };
  if (String(input.referenceDateHigh || "").length > 40 || String(input.referenceDateLow || "").length > 40) return { issue: { stock: name, message: "Reference date is too long." } };
  if (!parseIndianDate(String(input.referenceDateHigh))) return { issue: { stock: name, message: "Invalid referenceDateHigh." } };
  if (input.referenceDateLow && input.referenceDateLow !== "VERIFY_REQUIRED" && !parseIndianDate(String(input.referenceDateLow))) return { issue: { stock: name, message: "Invalid referenceDateLow." } };
  const normalized: GannInputStock = { ...input, stock: name, high: Number(input.high), low: input.low === undefined || input.low === "" || input.low === null ? null : Number(input.low), sector: String(input.sector || "").slice(0, 120), planet: String(input.planet || "").slice(0, 80), planetIcon: String(input.planetIcon || "").slice(0, 20), normalDailyMovement: String(input.normalDailyMovement || "Not provided").slice(0, 120) };
  if (normalized.low !== null && !Number.isFinite(normalized.low)) return { issue: { stock: name, message: "Low must be numeric." } };
  return { stock: normalized };
}
