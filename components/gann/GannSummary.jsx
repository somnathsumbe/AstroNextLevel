const cards = [
  ['bi-building', 'Stocks', 'stocks', 'Unique stocks'],
  ['bi-calendar3', 'Total Pressure Dates', 'records', 'Loaded JSON records'],
  ['bi-lightning-charge', 'High Priority', 'high', 'Important angles'],
  ['bi-sunrise', "Today's Pressure", 'today', 'Exact India date match'],
];

export default function GannSummary({ summary }) {
  return <section className="row g-3 mb-4" aria-label="Gann pressure summary">{cards.map(([icon, label, key, caption]) => <div className="col-12 col-sm-6 col-xl-3" key={key}><article className="metric-card gann-summary-card"><div className={`metric-icon ${key === 'high' ? 'gold' : key === 'records' ? 'blue' : ''}`}><i className={`bi ${icon}`} /></div><div className="metric-label">{label}</div><div className="metric-value">{summary[key].toLocaleString('en-IN')}</div><div className="metric-caption">{caption}</div></article></div>)}</section>;
}