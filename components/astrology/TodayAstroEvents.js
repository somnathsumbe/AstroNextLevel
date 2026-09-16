import AstroEventCard from '@/components/astrology/AstroEventCard';
import EmptyState from '@/components/ui/EmptyState';
import SectionHeader from '@/components/common/SectionHeader';

export default function TodayAstroEvents({ events, dateLabel }) {
  return (
    <section className="astro-events-section" aria-labelledby="today-astro-events-title">
      <SectionHeader eyebrow="LIVE CALENDAR / ASIA-KOLKATA" title="Today's Astro Events" titleId="today-astro-events-title" icon="bi-bell" meta={dateLabel} />
      {events.length ? <div className="row g-3">{events.map((event) => <div className="col-12 col-md-6 col-xl-4" key={event.id}><AstroEventCard event={event} /></div>)}</div> : <EmptyState icon="bi-calendar2-check" title="No Astro Events Today" description="There are no scheduled Astro events for today." />}
    </section>
  );
}
