'use client';

import { useEffect, useMemo, useState } from 'react';
import amavasyaData from '@/data/amavasya.json';
import purnimaData from '@/data/purnima.json';
import { parsePurnimaDate } from '@/lib/purnima-utils';
import { getAstroEvents } from '@/lib/astro-events';
import { getIndianDateKey, getTodayAstroEvents, getUpcomingAstroEvents } from '@/lib/notification-manager';
import { getRegisteredAstroEvents, registerAstroEvents } from '@/lib/event-registry';
import TodayAstroEvents from '@/components/astrology/TodayAstroEvents';
import UpcomingAstroEvents from '@/components/astrology/UpcomingAstroEvents';
import AstroEventSummary from '@/components/astrology/AstroEventSummary';
import CurrentDayStock from '@/components/gann/CurrentDayStock';

function formatToday(date) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(date);
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRecentLunarDates(type) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toDateKey(today);

  const values = type === 'amavasya'
    ? (amavasyaData.years || []).flatMap((yearData) => (yearData.entries || []).map((entry) => {
        const date = new Date(String(entry.start).replace(' ', 'T'));
        date.setHours(0, 0, 0, 0);
        return toDateKey(date);
      }))
    : Object.entries(purnimaData.years || {}).flatMap(([year, entries]) => entries.map((entry) => {
        const date = parsePurnimaDate(entry.date);
        date.setHours(0, 0, 0, 0);
        return toDateKey(date);
      }));

  const uniqueDates = [...new Set(values.filter(Boolean))].sort();
  const recent = uniqueDates.filter((value) => value <= todayKey).slice(-10);
  const upcoming = uniqueDates.find((value) => value > todayKey) || null;

  return { recent, upcoming };
}

export default function DashboardPage() {
  const allEvents = useMemo(() => {
    const events = getAstroEvents();
    registerAstroEvents(events, 'json-and-degree-calculator');
    return getRegisteredAstroEvents();
  }, []);
  const [now, setNow] = useState(null);
  const [copiedDate, setCopiedDate] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const lunar = useMemo(() => {
    const amavasya = getRecentLunarDates('amavasya');
    const purnima = getRecentLunarDates('purnima');
    return { amavasya, purnima };
  }, []);

  const currentMonthKey = now ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` : '';
  const nextMonthDate = now ? new Date(now.getFullYear(), now.getMonth() + 1, 1) : null;
  const nextMonthKey = nextMonthDate
    ? `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`
    : '';

  const [selectedAmavasyaDate, setSelectedAmavasyaDate] = useState(null);
  const [selectedPurnimaDate, setSelectedPurnimaDate] = useState(null);

  useEffect(() => {
    if (copiedDate) {
      const timeoutId = window.setTimeout(() => setCopiedDate(null), 1400);
      return () => window.clearTimeout(timeoutId);
    }
  }, [copiedDate]);

  async function copyDate(dateKey) {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(dateKey);
    setCopiedDate(dateKey);
  }

  const todayEvents = now ? getTodayAstroEvents(allEvents, now) : [];
  const upcomingEvents = now ? getUpcomingAstroEvents(allEvents, 5, now) : [];
  const todayKey = now ? getIndianDateKey(now) : '';

  function renderLunarSection({ title, dates, selectedDate, onSelect }) {
    return (
      <section className="dashboard-lunar-section">
        <div className="astro-section-heading">
          <h2><i className="bi bi-moon-stars" /> {title}</h2>
        </div>
        <div className="dashboard-lunar-grid row g-2">
          {dates.map((dateKey) => {
            const isSelected = selectedDate === dateKey;
            const isCurrentMonth = currentMonthKey && dateKey.slice(0, 7) === currentMonthKey;
            const isNextMonth = nextMonthKey && dateKey.slice(0, 7) === nextMonthKey;
            return (
              <div
                key={`${title}-${dateKey}`}
                className={`dashboard-lunar-card col-12 col-sm-6 col-md-4 col-lg-1 ${isSelected ? 'is-selected' : ''}`}
                aria-pressed={isSelected}
              >
                <button
                  type="button"
                  className="dashboard-lunar-date-button"
                  onClick={() => onSelect(dateKey)}
                  aria-label={`Select ${dateKey}`}
                >
                  <span className="dashboard-lunar-date">{dateKey}</span>
                </button>
                <div className="dashboard-lunar-meta">
                  <button
                    type="button"
                    className="dashboard-lunar-copy-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      copyDate(dateKey);
                    }}
                    aria-label={`Copy ${dateKey}`}
                    title={copiedDate === dateKey ? `Copied ${dateKey}` : `Copy ${dateKey}`}
                  >
                    <i className={`bi bi-${copiedDate === dateKey ? 'check2' : 'clipboard'}`} />
                  </button>
                  {isCurrentMonth && <span className="dashboard-lunar-status">Current</span>}
                  {isNextMonth && !isCurrentMonth && <span className="dashboard-lunar-status">Next</span>}
                  {isSelected && <span className="dashboard-lunar-status selected">✓ Selected</span>}
                </div>
              </div>
            );
          })}
        </div>

      </section>
    );
  }

  return (
    <div className="dashboard-page astro-dashboard">
      <div className="dashboard-welcome">
        <div>
          <div className="eyebrow">ASTROLOGY × MARKET OBSERVATION</div>
          <h1 className="page-title">Astro Market Analytics</h1>
          <p className="page-subtitle">Astrology-based calendar &amp; market observation</p>
        </div>
        <div className="dashboard-date"><i className="bi bi-calendar3" /> {now ? formatToday(now) : 'Loading date'}<small>India · Asia/Kolkata</small></div>
      </div>

      <div className="dashboard-lunar-wrap">
        {renderLunarSection({
          title: 'Amavasya',
          dates: lunar.amavasya.recent,
          selectedDate: selectedAmavasyaDate,
          onSelect: (dateKey) => setSelectedAmavasyaDate(dateKey),
        })}

        {renderLunarSection({
          title: 'Purnima',
          dates: lunar.purnima.recent,
          selectedDate: selectedPurnimaDate,
          onSelect: (dateKey) => setSelectedPurnimaDate(dateKey),
        })}
      </div>

      <CurrentDayStock />

      <TodayAstroEvents events={todayEvents} dateLabel={todayKey ? formatToday(now) : 'Loading'} />
      <AstroEventSummary events={todayEvents} />
      <UpcomingAstroEvents events={upcomingEvents} />
    </div>
  );
}
