import Link from 'next/link';

function displayDate(value) {
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)));
}

export default function UpcomingAstroEvents({ events }) {
  return (
    <section className="upcoming-events-section" aria-labelledby="upcoming-astro-events-title"><div className="astro-section-heading"><div><span className="eyebrow">NEXT OBSERVATIONS</span><h2 id="upcoming-astro-events-title"><i className="bi bi-clock-history" /> Upcoming Astro Events</h2></div><span className="astro-date-label">Next 5</span></div>{events.length ? <div className="upcoming-list">{events.map((event) => <Link href={event.route} className="upcoming-event-row" key={event.id}><span className="upcoming-date">{displayDate(event.eventDate)}</span><span className="upcoming-icon"><i className={`bi ${event.icon}`} /></span><span className="upcoming-title">{event.title}<small>{event.type.replace('_', ' ')} · {event.description}</small></span><i className="bi bi-arrow-up-right upcoming-arrow" /></Link>)}</div> : <div className="astro-empty-state compact"><span>No upcoming Astro events found.</span></div>}</section>
  );
}
