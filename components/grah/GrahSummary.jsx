export default function GrahSummary({ summary }) {
  const cards = [
    { label: 'Total Grah', value: summary.totalGrah, icon: 'bi-stars' },
    { label: 'Total Historical Records', value: summary.totalHistoricalRecords, icon: 'bi-database' },
    { label: 'Highest Avg Move', value: summary.highest ? `${summary.highest.planet} · ${summary.highest.avgPointsMove.toFixed(2)}` : 'N/A', icon: 'bi-graph-up-arrow' },
    { label: 'Lowest Avg Move', value: summary.lowest ? `${summary.lowest.planet} · ${summary.lowest.avgPointsMove.toFixed(2)}` : 'N/A', icon: 'bi-graph-down-arrow' },
  ];

  return (
    <section className="row g-3 mb-4" aria-label="Grah summary">
      {cards.map((card) => <div className="col-6 col-lg-3" key={card.label}><article className="grah-kpi-card h-100"><i className={`bi ${card.icon}`} aria-hidden="true" /><span>{card.label}</span><strong>{card.value}</strong></article></div>)}
    </section>
  );
}