export default function AstroEventSummary({ events }) {
  const counts = {
    PURNIMA: events.filter((event) => event.type === 'PURNIMA').length,
    AMAVASYA: events.filter((event) => event.type === 'AMAVASYA').length,
    DEGREE: events.filter((event) => event.type === 'DEGREE').length,
  };

  const cards = [
    ['PURNIMA', counts.PURNIMA, 'bi-moon-stars', 'purnima'],
    ['AMAVASYA', counts.AMAVASYA, 'bi-moon', 'amavasya'],
    ['DEGREE', counts.DEGREE, 'bi-bullseye', 'degree'],
    ['EVENTS TODAY', events.length, 'bi-bell', 'events'],
  ].filter(([, value, , tone]) => tone === 'events' || value > 0);

  return <section className="astro-summary-section" aria-label="Astro event summary"><div className="row g-3">{cards.map(([label, value, icon, tone]) => <div className="col-6 col-md-3" key={label}><div className={`astro-summary-card summary-${tone}`}><i className={`bi ${icon}`} /><span>{label}</span><strong>{value}</strong><small>{label === 'EVENTS TODAY' ? 'Active calendar events' : value ? 'Active today' : 'No event today'}</small></div></div>)}</div></section>;
}
