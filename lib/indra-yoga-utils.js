const MONTHS = new Map([
  ['jan', 1], ['january', 1],
  ['feb', 2], ['february', 2],
  ['mar', 3], ['march', 3],
  ['apr', 4], ['april', 4],
  ['may', 5],
  ['jun', 6], ['june', 6],
  ['jul', 7], ['july', 7],
  ['aug', 8], ['august', 8],
  ['sep', 9], ['sept', 9], ['september', 9],
  ['oct', 10], ['october', 10],
  ['nov', 11], ['november', 11],
  ['dec', 12], ['december', 12],
]);

export function getIndraYogaDateKey(value) {
  const source = String(value || '').trim();
  const numericDate = source.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const namedDate = source.match(/^(\d{4})-([a-z]+)-(\d{1,2})$/i);
  const year = Number(numericDate?.[1] || namedDate?.[1]);
  const month = Number(numericDate?.[2] || MONTHS.get(namedDate?.[2]?.toLowerCase()));
  const day = Number(numericDate?.[3] || namedDate?.[3]);
  if (!year || !month || !day) return null;

  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function getLocalDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatIndraYogaDate(value) {
  const dateKey = getIndraYogaDateKey(value);
  if (!dateKey) return value;
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day));
}

export function formatIndraYogaTime(value) {
  const match = String(value || '').match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return value;
  const hour = Number(match[1]);
  return `${String(hour % 12 || 12).padStart(2, '0')}:${match[2]} ${hour < 12 ? 'AM' : 'PM'}`;
}

export function validateIndraYogaEntries(entries) {
  if (!Array.isArray(entries)) throw new Error('IndraYog data must contain an entries array.');
  entries.forEach((entry, index) => {
    const valid = entry
      && typeof entry.date === 'string'
      && typeof entry.weekday === 'string'
      && typeof entry.yoga === 'string'
      && getIndraYogaDateKey(entry.date)
      && entry.begins
      && getIndraYogaDateKey(entry.begins.date)
      && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(entry.begins.time)
      && entry.ends
      && getIndraYogaDateKey(entry.ends.date)
      && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(entry.ends.time);
    if (!valid) throw new Error(`IndraYog entry ${index + 1} is missing a valid date, weekday, yoga, begins, or ends value.`);
  });
  return entries;
}

export function sortIndraYogaEntries(entries) {
  return [...entries].sort((left, right) => {
    const dateDifference = getIndraYogaDateKey(left.begins.date).localeCompare(getIndraYogaDateKey(right.begins.date));
    return dateDifference || left.begins.time.localeCompare(right.begins.time);
  });
}

export function isIndraYogaStartingToday(entry, now = new Date()) {
  return getIndraYogaDateKey(entry.begins.date) === getLocalDateKey(now);
}

export function filterIndraYogaEntries(entries, { year = '', month = '', search = '' } = {}) {
  const query = search.trim().toLocaleLowerCase();
  return entries.filter((entry) => {
    const startDate = getIndraYogaDateKey(entry.begins.date);
    if (year && startDate.slice(0, 4) !== String(year)) return false;
    if (month && Number(startDate.slice(5, 7)) !== Number(month)) return false;
    if (!query) return true;
    const searchable = [
      entry.date,
      entry.weekday,
      entry.yoga,
      entry.begins.date,
      entry.begins.time,
      entry.ends.date,
      entry.ends.time,
      formatIndraYogaDate(entry.date),
      formatIndraYogaDate(entry.begins.date),
      formatIndraYogaDate(entry.ends.date),
      formatIndraYogaTime(entry.begins.time),
      formatIndraYogaTime(entry.ends.time),
    ].join(' ').toLocaleLowerCase();
    return searchable.includes(query);
  });
}

export function getTodaysIndraYogaEntries(entries, now = new Date()) {
  return sortIndraYogaEntries(entries.filter((entry) => isIndraYogaStartingToday(entry, now)));
}

export function toIndraYogaAstroEvents(entries) {
  return entries.map((entry) => {
    const eventDate = getIndraYogaDateKey(entry.begins.date);
    return {
      id: `indra-yoga-${eventDate}-${entry.begins.time}`,
      type: 'INDRA_YOGA',
      title: 'IndraYog',
      shortTitle: 'Indra Yoga Today',
      eventDate,
      displayDate: formatIndraYogaDate(entry.begins.date),
      startTime: formatIndraYogaTime(entry.begins.time),
      endTime: formatIndraYogaTime(entry.ends.time),
      endDate: getIndraYogaDateKey(entry.ends.date),
      description: 'Indra Yoga',
      sourcePage: 'IndraYog',
      route: '/indra-yog',
      icon: 'bi-stars',
      priority: 'MEDIUM',
    };
  });
}

export function appendTodaysIndraYogaEvents(events, entries, now = new Date()) {
  return [...events, ...toIndraYogaAstroEvents(getTodaysIndraYogaEntries(entries, now))];
}
