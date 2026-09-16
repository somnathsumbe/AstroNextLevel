const DAY_MS = 86400000;

function parseParts(value) {
  const parts = String(value || '').trim().split(/[-/]/).map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return null;
  return parts[0] > 31 ? { year: parts[0], month: parts[1], day: parts[2] } : { year: parts[2], month: parts[1], day: parts[0] };
}

export function parseInputDate(value, time = '09:15') {
  if (!value || value === 'VERIFY_REQUIRED') return null;
  const parts = parseParts(value);
  const [hour, minute] = String(time || '09:15').split(':').map(Number);
  if (!parts || !Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  const check = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  if (check.getUTCFullYear() !== parts.year || check.getUTCMonth() !== parts.month - 1 || check.getUTCDate() !== parts.day) return null;
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, hour, minute) - 19_800_000);
}

export function getReference(stock, type) {
  const low = type === 'Major Low';
  return {
    date: low ? stock?.referenceDateLow : stock?.referenceDateHigh,
    value: low ? stock?.low : stock?.high,
    type: low ? stock?.referenceTypeLow || 'Major Low' : stock?.referenceTypeHigh || 'Major High',
  };
}

export function calculateStockPressureDates({
  stock,
  referenceDate,
  referenceTime,
  referenceType,
  angles,
  importantAngles,
  defaultTime = '09:15',
}) {
  const base = parseInputDate(referenceDate, referenceTime || defaultTime);
  if (!base) return [];

  return angles.map((angle) => {
    const days = (angle / 360) * 365.25;
    const pressureDate = new Date(base.getTime() + days * DAY_MS);
    return {
      id: `${stock.stock}-${angle}`,
      angle,
      pressureDate,
      priority: importantAngles.has(angle) ? 'IMPORTANT' : 'SECONDARY',
      indiaTime: referenceTime || defaultTime,
      stock: stock.stock,
      sector: stock.sector,
      normalDailyMovement: stock.normalDailyMovement || '—',
      planet: stock.planet || 'Not provided',
      planetIcon: stock.planetIcon || '—',
      referenceDate,
      referenceType,
      referenceValue: referenceType === 'Major Low' ? stock.low : stock.high,
      timeframe: '15 Min',
    };
  });
}

export function e2eNormalizeDate(value) {
  const [year, month, day] = (value || '').split('-');
  return year && month && day ? `${day}-${month}-${year}` : value || '—';
}

export function inputDate(value) {
  const parts = (value || '').split('-');
  return parts[0]?.length === 2 ? `${parts[2]}-${parts[1]}-${parts[0]}` : value || '';
}
