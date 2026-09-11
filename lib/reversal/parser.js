export const PLANETS = ['Sun', 'Mars', 'Mercury', 'Moon', 'Saturn', 'Venus', 'Jupiter'];

export const PLANET_META = {
  Sun: { icon: '☀', quality: 'Vigorous' },
  Mars: { icon: '♂', quality: 'Aggressive' },
  Mercury: { icon: '☿', quality: 'Quick' },
  Moon: { icon: '☾', quality: 'Gentle' },
  Saturn: { icon: '♄', quality: 'Sluggish' },
  Venus: { icon: '♀', quality: 'Beneficial' },
  Jupiter: { icon: '♃', quality: 'Fruitful' },
};

export function timeToMinutes(value = '') {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return hour * 60 + Number(match[2]);
}

export function parseReversalData(payload) {
  return (payload?.data || []).map((record) => {
    const [planetFromName, qualityFromName = ''] = String(record.grah_name || '').split(' - ');
    const planet = PLANET_META[planetFromName] ? planetFromName : PLANETS.find((name) => String(record.grah_name || '').toLowerCase().includes(name.toLowerCase())) || planetFromName || 'Unknown';
    return {
      id: record.id,
      date: record.date,
      isoDate: record.sort_date,
      planet,
      quality: qualityFromName || PLANET_META[planet]?.quality || 'Historical',
      degree: Number(record.degree),
      reversalTime: record.end_time,
      startTime: record.start_time,
      tradeTime: record.trade_time,
      sortTime: record.sort_time,
      timeMinutes: timeToMinutes(record.end_time),
      source: record,
    };
  }).filter((record) => record.planet && Number.isFinite(record.degree));
}

export function formatDateLabel(isoDate, options = { day: '2-digit', month: 'short', year: 'numeric' }) {
  if (!isoDate) return '';
  return new Intl.DateTimeFormat('en-IN', { ...options, timeZone: 'Asia/Kolkata' }).format(new Date(`${isoDate}T12:00:00+05:30`));
}

export function getDegreeCategory(degree) {
  if (degree < 10) return 'Early';
  if (degree < 20) return 'Middle';
  if (degree < 28) return 'Late';
  return 'Near 30°';
}

export function recordsForDate(records, isoDate) { return records.filter((record) => record.isoDate === isoDate).sort((a, b) => a.timeMinutes - b.timeMinutes); }
export function latestByPlanet(records) { return PLANETS.map((planet) => records.filter((record) => record.planet === planet).sort((a, b) => `${b.isoDate}${b.sortTime}`.localeCompare(`${a.isoDate}${a.sortTime}`))[0]).filter(Boolean); }
export function getStats(records) {
  const degrees = records.map((record) => record.degree);
  return { count: records.length, average: degrees.length ? degrees.reduce((sum, value) => sum + value, 0) / degrees.length : 0, min: degrees.length ? Math.min(...degrees) : 0, max: degrees.length ? Math.max(...degrees) : 0, morning: records.filter((record) => record.timeMinutes < 720).length, afternoon: records.filter((record) => record.timeMinutes >= 720).length };
}
export function getDateRange(records) { return [...new Set(records.map((record) => record.isoDate))].sort((a, b) => b.localeCompare(a)); }
