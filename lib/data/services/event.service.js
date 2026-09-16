import { getAllAstrologyEvents } from '@/lib/data/repositories/event.repository';
import { getTodayAstroEvents, getUpcomingAstroEvents } from '@/lib/notification-manager';

export const eventService = {
  getAll() {
    return getAllAstrologyEvents();
  },
  getToday(date = new Date()) {
    return getTodayAstroEvents(getAllAstrologyEvents(), date);
  },
  getUpcoming(limit = 5, date = new Date()) {
    return getUpcomingAstroEvents(getAllAstrologyEvents(), limit, date);
  },
};