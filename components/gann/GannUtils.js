const INDIA_TIME_ZONE = 'Asia/Kolkata';

function parseDateValue(value) {
  if (value === null || value === undefined || value === '') return null;

  const raw = String(value).trim();
  if (!raw) return null;

  const directMatch = raw.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/);
  if (directMatch) {
    const parsed = new Date(`${directMatch[1]} ${directMatch[2]} ${directMatch[3]} 00:00:00 GMT+0530`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const isoMatch = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const parsed = new Date(`${isoMatch[1]}-${String(isoMatch[2]).padStart(2, '0')}-${String(isoMatch[3]).padStart(2, '0')}T00:00:00+05:30`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const dmyMatch = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const parsed = new Date(`${dmyMatch[3]}-${String(dmyMatch[2]).padStart(2, '0')}-${String(dmyMatch[1]).padStart(2, '0')}T00:00:00+05:30`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getIndiaTodayKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: INDIA_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function canonicalPriority(value) {
  if (value === null || value === undefined || value === '') return 'Secondary';
  const cleaned = String(value).trim();
  const normalized = cleaned.toLowerCase();

  if (['high', 'important', 'important angle', 'high priority', 'priority high'].includes(normalized)) return 'High';
  if (['secondary', 'normal', 'low', 'medium', 'mid', 'secondary angle', 'regular'].includes(normalized)) return 'Secondary';

  return cleaned;
}

export function normalizePressureRecord(record = {}) {
  const getValue = (...keys) => {
    for (const key of keys) {
      const value = record[key];
      if (value !== undefined && value !== null && String(value).trim() !== '') return value;
    }
    return '';
  };

  const pressureDate = getValue('PressureDate', 'pressureDate', 'pressure_date', 'pressureDateValue', 'date');
  const stock = getValue('stock', 'Stock', 'symbol', 'stockSymbol', 'security');
  const planet = getValue('planet', 'Planet', 'planetName', 'planet_name');
  const planetIcon = getValue('planetIcon', 'PlanetIcon', 'planet_icon', 'icon', 'planetEmoji');
  const sector = getValue('sector', 'Sector', 'industry', 'segment');
  const angle = getValue('angle', 'Angle', 'angleDegree', 'degrees');
  const day = getValue('Day', 'day', 'dayName', 'pressureDay');
  const priority = getValue('priority', 'Priority', 'priorityLevel', 'riskLevel');
  const referenceTypeHigh = getValue('referenceTypeHigh', 'ReferenceType', 'referenceType', 'reference', 'referenceTypeValue', 'referenceHigh');
  const referenceDateHigh = getValue('referenceDateHigh', 'ReferenceDate', 'referenceDate', 'referenceDateHighValue');
  const high = getValue('high', 'High', 'ReferenceValue', 'highValue', 'targetHigh');
  const referenceDateLow = getValue('referenceDateLow', 'LowDate', 'lowDate', 'lowReferenceDate', 'referenceLowDate', 'referenceDate');
  const low = getValue('low', 'Low', 'lowValue', 'targetLow');
  const normalDailyMovement = getValue('normalDailyMovement', 'Movement', 'normalDailyMove', 'dailyMovement', 'normalDailyRange');

  const normalizedStock = String(stock || '').trim();
  const normalizedPriority = canonicalPriority(priority);
  const normalizedPlanet = String(planet || '').trim();
  const normalizedPlanetIcon = String(planetIcon || '').trim();

  return {
    ...record,
    stock: normalizedStock,
    Stock: normalizedStock,
    PressureDate: pressureDate || '',
    pressureDate: pressureDate || '',
    angle: angle ?? '',
    Angle: angle ?? '',
    Day: day || '',
    day: day || '',
    priority: normalizedPriority,
    Priority: normalizedPriority,
    referenceTypeHigh: referenceTypeHigh || '',
    ReferenceType: referenceTypeHigh || '',
    high: high ?? '',
    High: high ?? '',
    referenceDateHigh: referenceDateHigh || '',
    ReferenceDate: referenceDateHigh || '',
    referenceDateLow: referenceDateLow || '',
    LowDate: referenceDateLow || '',
    low: low ?? '',
    Low: low ?? '',
    sector: sector || '',
    Sector: sector || '',
    planet: normalizedPlanet,
    Planet: normalizedPlanet,
    planetIcon: normalizedPlanetIcon,
    PlanetIcon: normalizedPlanetIcon,
    normalDailyMovement: normalDailyMovement || '',
    Movement: normalDailyMovement || ''
  };
}

export function normalizePressureRecords(records) {
  if (!Array.isArray(records)) return [];
  return records.map((record) => normalizePressureRecord(record));
}

export function pressureDateKey(value) {
  if (!value) return '';
  const parsed = parseDateValue(value);
  if (!parsed) return '';
  return getIndiaTodayKey(parsed);
}

export function isTodayPressureDate(value, todayKey = getIndiaTodayKey()) {
  return pressureDateKey(value) === todayKey;
}

export function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '-';
  const numericValue = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : '-';
}

export function planetIcon(value) {
  return value && !String(value).includes('ð') ? value : '';
}