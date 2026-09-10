import AstroEventCard from '@/components/astrology/AstroEventCard';

export default function TodayAstroEvents({ events, dateLabel }) {
  return (
    <section className="astro-events-section" aria-labelledby="today-astro-events-title">
      <div className="astro-section-heading"><div><span className="eyebrow">LIVE CALENDAR / ASIA-KOLKATA</span><h2 id="today-astro-events-title"><i className="bi bi-bell" /> Today's Astro Events</h2></div><span className="astro-date-label">{dateLabel}</span></div>
      {events.length ? <div className="row g-3">{events.map((event) => <div className="col-12 col-md-6 col-xl-4" key={event.id}><AstroEventCard event={event} /></div>)}</div> : <div className="astro-empty-state"><i className="bi bi-calendar2-check" /><strong>No Astro Events Today</strong><span>There are no scheduled Astro events for today.</span></div>}
    </section>
  );
}
