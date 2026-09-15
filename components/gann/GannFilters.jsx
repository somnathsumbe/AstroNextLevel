function optionLabel(value, icons) {
  const icon = icons[value];
  return icon ? `${icon} ${value}` : value;
}

export default function GannFilters({
  values,
  options,
  icons,
  dateLabel,
  onChange,
  onReset,
}) {
  return (
    <section className="filter-panel gann-today-filters" aria-label="Today stock filters">
      <div className="filter-title">
        <span><i className="bi bi-funnel" /> Filter Pressure Dates</span>
        <span className="filter-count">All filters combine</span>
      </div>
      <div className="row g-3 align-items-end filter-primary-row">
        <div className="col-12 col-md-6 col-xl">
          <label htmlFor="today-stock-filter">Stock Filter</label>
          <select id="today-stock-filter" className="form-select" value={values.stock} onChange={(event) => onChange("stock", event.target.value)}>
            <option value="all">All Stocks</option>
            {options.stocks.map((stock) => <option key={stock} value={stock}>{stock}</option>)}
          </select>
        </div>
        <div className="col-12 col-md-6 col-xl">
          <label htmlFor="today-planet-filter">Planet Filter</label>
          <select id="today-planet-filter" className="form-select" value={values.planet} onChange={(event) => onChange("planet", event.target.value)}>
            <option value="all">All Planets</option>
            {options.planets.map((planet) => <option key={planet} value={planet}>{optionLabel(planet, icons)}</option>)}
          </select>
        </div>
        <div className="col-12 col-md-6 col-xl">
          <label htmlFor="today-sector-filter">Sector Filter</label>
          <select id="today-sector-filter" className="form-select" value={values.sector} onChange={(event) => onChange("sector", event.target.value)}>
            <option value="all">All Sectors</option>
            {options.sectors.map((sector) => <option key={sector} value={sector}>{sector}</option>)}
          </select>
        </div>
        <div className="col-12 col-md-6 col-xl">
          <label>Date Filter</label>
          <div className="date-filter-controls" role="group" aria-label="Pressure date filter">
            <button type="button" className={`btn ${values.dateOffset === "all" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => onChange("dateOffset", "all")}>All</button>
            <button type="button" className="btn btn-outline-primary" onClick={() => onChange("dateOffset", values.dateOffset === "all" ? -1 : values.dateOffset - 1)} aria-label="Previous day" title="Previous day"><i className="bi bi-chevron-left" /></button>
            <span aria-live="polite">{dateLabel}</span>
            <button type="button" className="btn btn-outline-primary" onClick={() => onChange("dateOffset", values.dateOffset === "all" ? 1 : values.dateOffset + 1)} aria-label="Next day" title="Next day"><i className="bi bi-chevron-right" /></button>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl">
          <label htmlFor="today-priority-filter">Priority</label>
          <select id="today-priority-filter" className="form-select" value={values.priority} onChange={(event) => onChange("priority", event.target.value)}>
            <option value="all">All</option>
            {options.priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
        </div>
        <div className="col-12 col-md-6 col-xl">
          <label htmlFor="today-reference-filter">Reference Type</label>
          <select id="today-reference-filter" className="form-select" value={values.referenceType} onChange={(event) => onChange("referenceType", event.target.value)}>
            <option value="all">All References</option>
            {options.referenceTypes.map((referenceType) => <option key={referenceType} value={referenceType}>{referenceType}</option>)}
          </select>
        </div>
      </div>
      <div className="row g-3 align-items-end filter-search-row">
        <div className="col-12 col-lg-8">
          <label htmlFor="today-stock-search">Search Stock</label>
          <div className="filter-search"><i className="bi bi-search" /><input id="today-stock-search" className="form-control" value={values.search} onChange={(event) => onChange("search", event.target.value)} placeholder="Search stock name..." /></div>
        </div>
        <div className="col-12 col-lg-4 filter-actions gann-reset-action">
          <button className="subtle-action" type="button" onClick={onReset}><i className="bi bi-arrow-counterclockwise" /> Reset Filters</button>
        </div>
      </div>
    </section>
  );
}
