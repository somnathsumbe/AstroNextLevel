export default function GrahPageHeader() {
  return (
    <header className="grah-page-header">
      <div>
        <div className="eyebrow">ASTRO MARKET ANALYSIS</div>
        <h1 className="page-title">📊 Grah Past Records</h1>
        <p className="page-subtitle">Planet-wise Nifty Historical Analysis</p>
      </div>
      <div className="grah-header-meta" aria-label="Dataset status">
        <span><i className="bi bi-clock-history" aria-hidden="true" /> Historical Data</span>
        <span><i className="bi bi-stars" aria-hidden="true" /> 7 Grah</span>
      </div>
    </header>
  );
}