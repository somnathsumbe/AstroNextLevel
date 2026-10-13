import Link from 'next/link';

function displayDate(value) {
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)));
}

export default function AstroEventCard({ event }) {
  const isDegree = event.type === 'DEGREE';
  const isIndraYoga = event.type === 'INDRA_YOGA';
  const isTimedEvent = ['BHADRA', 'PANCHAK', 'MANGAL_GOCHAR', 'CUSTOM', 'INDRA_YOGA'].includes(event.type);
  const endDetails = isIndraYoga && event.endDate !== event.eventDate ? `${event.endTime} · ${displayDate(event.endDate)}` : event.endTime;
  const eventName = isIndraYoga ? 'IndraYog' : event.type === 'PURNIMA' ? 'Purnima' : event.type === 'AMAVASYA' ? 'Amavasya' : event.title;
  return (
    <Link href={event.route} className={`astro-event-card event-${event.type.toLowerCase()}`}>
      <div className="astro-card-top"><span className="astro-event-icon"><i className={`bi ${event.icon}`} /></span><span className="astro-today-badge">TODAY</span></div>
      <div className="astro-event-type">{event.type.replace('_', ' ')}</div>
      <h3>{eventName}</h3>
      <p className="astro-event-short">{event.shortTitle}</p>
      <div className="astro-event-date"><i className="bi bi-calendar3" /> {displayDate(event.eventDate)}</div>
      {isDegree ? <div className="astro-degree-meta"><span><small>Target Degree</small><strong>{event.degree}°</strong></span><span><small>Actual Degree</small><strong>{Number(event.actualDegree).toFixed(4)}°</strong></span></div> : isTimedEvent ? <div className="astro-degree-meta"><span><small>{isIndraYoga ? 'Begins' : 'Time'}</small><strong>{event.startTime}</strong></span><span><small>{isIndraYoga ? 'Ends' : 'Event'}</small><strong>{isIndraYoga ? endDetails : event.description}</strong></span></div> : <p className="astro-event-description">{event.description}</p>}
      {isDegree && event.marketStatus && <div className="astro-status-line"><small>Market Status</small><span>{event.marketStatus}</span></div>}
      <div className="astro-card-link">View {isDegree ? (event.sourcePage === 'Jupiter Venus Tracking' ? 'Jupiter Venus Tracking' : 'Degree Calculator') : isIndraYoga ? 'IndraYog' : event.type === 'PURNIMA' ? 'Purnima' : event.type === 'AMAVASYA' ? 'Amavasya' : event.type === 'BHADRA' ? 'Bhadra Kaal' : event.type === 'PANCHAK' ? 'Panchak' : event.type === 'MANGAL_GOCHAR' ? 'Mangal Gochar' : 'Shukra Gochar'} <i className="bi bi-arrow-up-right" /></div>
    </Link>
  );
}
