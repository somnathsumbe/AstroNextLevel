import { GANN_ANGLES, IMPORTANT_ANGLES, DAY_MS, DEFAULT_INDIA_TIME } from "@/lib/gann/constants";
import { formatPressureDate, parseIndianDate } from "@/lib/date/date-utils";
import type { GannInputStock, GannPressureRecord, ReferenceType } from "@/lib/stocks/stock-types";

export function getReference(stock: GannInputStock, referenceType: ReferenceType) {
  const low = referenceType === "Major Low";
  return { date: low ? stock.referenceDateLow || "" : stock.referenceDateHigh || "", value: low ? stock.low ?? null : stock.high ?? null, type: low ? stock.referenceTypeLow || "Major Low" : stock.referenceTypeHigh || "Major High" };
}

export function calculatePressureDates(stock: GannInputStock, referenceType: ReferenceType = "Major High", referenceTime = DEFAULT_INDIA_TIME): GannPressureRecord[] {
  const reference = getReference(stock, referenceType);
  const base = parseIndianDate(reference.date, referenceTime);
  if (!base) return [];
  return GANN_ANGLES.map((angle) => {
    const pressureDate = new Date(base.getTime() + (angle / 360) * 365.25 * DAY_MS);
    return {
      Stock: stock.stock.trim().toUpperCase(), PressureDate: formatPressureDate(pressureDate),
      Day: new Intl.DateTimeFormat("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" }).format(pressureDate),
      Priority: IMPORTANT_ANGLES.has(angle) ? "HIGH" : "SECONDARY", Angle: angle, IndiaTime: referenceTime,
      Planet: stock.planet || "Not provided", PlanetIcon: stock.planetIcon || "", Sector: stock.sector || "",
      ReferenceValue: reference.value == null ? null : Number(reference.value), ReferenceDate: reference.date, ReferenceType: reference.type,
      Movement: stock.normalDailyMovement || "Not provided", LowDate: stock.referenceDateLow || "", Low: stock.low == null || stock.low === "" ? null : Number(stock.low),
    };
  });
}

export function getRecordKey(record: Pick<GannPressureRecord, "Stock" | "ReferenceType" | "ReferenceDate" | "ReferenceValue" | "Angle" | "IndiaTime">): string {
  return [record.Stock, record.ReferenceType, record.ReferenceDate, record.ReferenceValue ?? "", record.Angle, record.IndiaTime].join("|");
}
