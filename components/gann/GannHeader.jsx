export default function GannHeader() {
  return (
    <header className="page-heading-row gann-today-heading">
      <div>
        <div className="eyebrow">MARKET ANALYSIS</div>
        <h1 className="page-title">Today Stock Pressure</h1>
        <p className="page-subtitle">Stock-wise Gann angle pressure dates and market observation zones</p>
        <nav className="breadcrumb-line" aria-label="Breadcrumb"><i className="bi bi-house" /> <a href="/dashboard">Dashboard</a> <span>/</span> Today Stock</nav>
      </div>
      <div className="gann-today-chip"><i className="bi bi-clock-history" /> India time · Asia/Kolkata</div>
    </header>
  );
}