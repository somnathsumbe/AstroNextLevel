import Link from 'next/link';

const actions = [
  ['Today Stock', '/today-stock', 'bi-bar-chart-line', 'View current pressure dates'],
  ['Stocks Times', '/stocks-times', 'bi-clock', 'Explore stock timing'],
  ['Degree Calculator', '/degree-calculator', 'bi-bullseye', 'Review calculated levels'],
  ['Reversal Time', '/reversal-time', 'bi-arrow-repeat', 'Study planetary reversals'],
  ['Rashi Nakshatra', '/rashi-nakshatra', 'bi-diagram-3', 'Open astrology reference'],
  ['Gann Generator', '/market-analysis/stock-gann-pressure', 'bi-lightning-charge', 'Generate pressure dates'],
];

export default function DashboardQuickActions() {
  return <section className="dashboard-quick-actions" aria-labelledby="dashboard-quick-actions-title">
    <div className="dashboard-secondary-heading"><span className="eyebrow">QUICK ACCESS</span><h2 id="dashboard-quick-actions-title">Research modules</h2></div>
    <div className="dashboard-quick-grid">
      {actions.map(([label, href, icon, description]) => <Link href={href} className="dashboard-quick-action" key={href}><span className="dashboard-quick-icon"><i className={`bi ${icon}`} aria-hidden="true" /></span><span><strong>{label}</strong><small>{description}</small></span><i className="bi bi-arrow-up-right" aria-hidden="true" /></Link>)}
    </div>
  </section>;
}