const INDIA_TIME_ZONE = 'Asia/Kolkata';
const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export function getIndianDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: INDIA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function isSameIndianDate(eventDate, date = new Date()) {
  return String(eventDate).slice(0, 10) === getIndianDateKey(date);
}

export function isEventExpired(event, date = new Date()) {
  return String(event.eventDate).slice(0, 10) < getIndianDateKey(date);
}

export function getEventStatus(event, date = new Date()) {
  if (isSameIndianDate(event.eventDate, date)) return 'TODAY';
  return isEventExpired(event, date) ? 'EXPIRED' : 'UPCOMING';
}

export function withEventStatuses(events, date = new Date()) {
  return events.map((event) => ({ ...event, status: getEventStatus(event, date) }));
}

export function sortAstroEvents(events) {
  return [...events].sort((first, second) => {
    const priorityDifference = (PRIORITY_ORDER[first.priority || 'LOW'] ?? 2) - (PRIORITY_ORDER[second.priority || 'LOW'] ?? 2);
    if (priorityDifference !== 0) return priorityDifference;
    return String(first.eventDate).localeCompare(String(second.eventDate));
  });
}

export function getTodayAstroEvents(events, date = new Date()) {
  return sortAstroEvents(withEventStatuses(events, date).filter((event) => event.status === 'TODAY'));
}

export function getUpcomingAstroEvents(events, limit = 5, date = new Date()) {
  return withEventStatuses(events, date)
    .filter((event) => event.status === 'UPCOMING')
    .sort((first, second) => String(first.eventDate).localeCompare(String(second.eventDate)))
    .slice(0, limit);
}

export function getNextAstroEvent(events, date = new Date()) {
  return getUpcomingAstroEvents(events, 1, date)[0] || null;
}

export function groupEventsByDate(events) {
  return events.reduce((groups, event) => {
    const key = String(event.eventDate).slice(0, 10);
    groups[key] = [...(groups[key] || []), event];
    return groups;
  }, {});
}
