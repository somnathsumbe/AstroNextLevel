import { DAY_MS, DEFAULT_INDIA_TIME, INDIA_TIME_ZONE } from "@/lib/gann/constants";

function parseParts(value: string) {
  const parts = String(value || "").trim().split(/[-/]/).map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return null;
  return parts[0] > 31 ? { year: parts[0], month: parts[1], day: parts[2] } : { year: parts[2], month: parts[1], day: parts[0] };
}

export function parseIndianDate(value: string, time = DEFAULT_INDIA_TIME): Date | null {
  if (!value || value === "VERIFY_REQUIRED") return null;
  const parts = parseParts(value);
  const [hour, minute] = String(time || DEFAULT_INDIA_TIME).split(":").map(Number);
  if (!parts || !Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  const check = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  if (check.getUTCFullYear() !== parts.year || check.getUTCMonth() !== parts.month - 1 || check.getUTCDate() !== parts.day) return null;
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, hour, minute) - 19_800_000);
}

export function formatIndianDate(value: Date): string {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: INDIA_TIME_ZONE }).format(value);
}

export function getIndiaToday(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: INDIA_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function formatPressureDate(value: Date): string {
  return formatIndianDate(value);
}

export function pressureDateKey(value: string): string {
  const parsed = parseIndianDate(value);
  return parsed ? getIndiaToday(parsed) : "";
}

export function isToday(value: string): boolean { return pressureDateKey(value) === getIndiaToday(); }
export function isTomorrow(value: string): boolean {
  const tomorrow = new Date(`${getIndiaToday()}T00:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return pressureDateKey(value) === tomorrow.toISOString().slice(0, 10);
}
export function addIndiaDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export { DAY_MS, DEFAULT_INDIA_TIME, INDIA_TIME_ZONE };
