import { amavasyaService } from '@/lib/data/services/astrology/amavasya.service';
import { purnimaService } from '@/lib/data/services/astrology/purnima.service';
import { eventService } from '@/lib/data/services/event.service';
import { getIndianDateKey, getTodayAstroEvents, getUpcomingAstroEvents } from '@/lib/notification-manager';
import { parsePurnimaDate } from '@/lib/purnima-utils';

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRecentLunarDates(type, today = new Date()) {
  const todayDate = new Date(today);
  todayDate.setHours(0, 0, 0, 0);
  const todayKey = toDateKey(todayDate);
  const amavasyaData = amavasyaService.getData();
  const purnimaData = purnimaService.getData();
  const values = type === 'amavasya'
    ? (amavasyaData.years || []).flatMap((yearData) => (yearData.entries || []).map((entry) => {
        const date = new Date(String(entry.start).replace(' ', 'T'));
        date.setHours(0, 0, 0, 0);
        return toDateKey(date);
      }))
    : Object.values(purnimaData.years || {}).flatMap((entries) => entries.map((entry) => {
        const date = parsePurnimaDate(entry.date);
        date.setHours(0, 0, 0, 0);
        return toDateKey(date);
      }));

  const uniqueDates = [...new Set(values.filter(Boolean))].sort();
  return { recent: uniqueDates.filter((value) => value <= todayKey).slice(-10), upcoming: uniqueDates.find((value) => value > todayKey) || null };
}

export function getDashboardData(now = new Date()) {
  const allEvents = eventService.getAll();
  return {
    now,
    todayKey: getIndianDateKey(now),
    todayEvents: getTodayAstroEvents(allEvents, now),
    upcomingEvents: getUpcomingAstroEvents(allEvents, 5, now),
    lunar: { amavasya: getRecentLunarDates('amavasya', now), purnima: getRecentLunarDates('purnima', now) },
  };
}