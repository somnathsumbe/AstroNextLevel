import Link from 'next/link';
import EmptyState from '@/components/ui/EmptyState';
import SectionHeader from '@/components/common/SectionHeader';

function displayDate(value) {
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)));
}

export default function UpcomingAstroEvents({ events }) {
  return (
    <section className="upcoming-events-section" aria-labelledby="upcoming-astro-events-title"><SectionHeader eyebrow="NEXT OBSERVATIONS" title="Upcoming Astro Events" titleId="upcoming-astro-events-title" icon="bi-clock-history" meta="Next 5" />{events.length ? <div className="upcoming-list">{events.map((event) => <Link href={event.route} className="upcoming-event-row" key={event.id}><span className="upcoming-date">{displayDate(event.eventDate)}</span><span className="upcoming-icon"><i className={`bi ${event.icon}`} /></span><span className="upcoming-title">{event.title}<small>{event.type.replace('_', ' ')} · {event.description}</small></span><i className="bi bi-arrow-up-right upcoming-arrow" /></Link>)}</div> : <EmptyState className="compact" title="No upcoming Astro events found." />}</section>
  );
}
