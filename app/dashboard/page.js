'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAstroEvents } from '@/lib/astro-events';
import { getIndianDateKey, getTodayAstroEvents, getUpcomingAstroEvents } from '@/lib/notification-manager';
import { getRegisteredAstroEvents, registerAstroEvents } from '@/lib/event-registry';
import TodayAstroEvents from '@/components/astrology/TodayAstroEvents';
import UpcomingAstroEvents from '@/components/astrology/UpcomingAstroEvents';
import AstroEventSummary from '@/components/astrology/AstroEventSummary';

function formatToday(date) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(date);
}

export default function DashboardPage() {
  const allEvents = useMemo(() => {
    const events = getAstroEvents();
    registerAstroEvents(events, 'json-and-degree-calculator');
    return getRegisteredAstroEvents();
  }, []);
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const todayEvents = now ? getTodayAstroEvents(allEvents, now) : [];
  const upcomingEvents = now ? getUpcomingAstroEvents(allEvents, 5, now) : [];
  const todayKey = now ? getIndianDateKey(now) : '';

  return (
    <div className="dashboard-page astro-dashboard"><div className="dashboard-welcome"><div><div className="eyebrow">ASTROLOGY × MARKET OBSERVATION</div><h1 className="page-title">Astro Market Analytics</h1><p className="page-subtitle">Astrology-based calendar &amp; market observation</p></div><div className="dashboard-date"><i className="bi bi-calendar3" /> {now ? formatToday(now) : 'Loading date'}<small>India · Asia/Kolkata</small></div></div><TodayAstroEvents events={todayEvents} dateLabel={todayKey ? formatToday(now) : 'Loading'} /><AstroEventSummary events={todayEvents} /><UpcomingAstroEvents events={upcomingEvents} /></div>
  );
}
