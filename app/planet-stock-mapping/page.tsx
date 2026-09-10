'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import rawData from '@/src/data/planet-stock-mapping.json';
import { formatSectorName, normalizeSectors, stockKey, uniqueStockCount } from '@/src/lib/planet-stock-mapping';
import type { PlanetStockMappingDataset, SelectedStock, Stock } from '@/src/types/planet-stock-mapping';

const DATA = rawData as unknown as PlanetStockMappingDataset;
const PLANET_NAMES = Object.keys(DATA.planets);

export default function PlanetStockMappingPage() {
  const [selectedPlanet, setSelectedPlanet] = useState(PLANET_NAMES[0] || '');
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [search, setSearch] = useState('');
  const [selectedStocks, setSelectedStocks] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 220);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => setMessage(''), 4500);
    return () => window.clearTimeout(timer);
  }, [message]);

  const planet = DATA.planets[selectedPlanet];
  const sectors = useMemo(() => (planet ? normalizeSectors(planet) : {}), [planet]);
  const sectorNames = Object.keys(sectors);
  const currentPlanetStocks = useMemo(() => Object.values(sectors).flat(), [sectors]);
  const visibleSectors = useMemo(() => {
    const query = search.trim().toLowerCase();
    return Object.entries(sectors)
      .filter(([sector]) => selectedSector === 'All Sectors' || selectedSector === sector)
      .map(([sector, stocks]) => [sector, stocks.filter((stock) => !query || `${stock.name} ${stock.symbol}`.toLowerCase().includes(query))] as const)
      .filter(([, stocks]) => stocks.length > 0);
  }, [search, sectors, selectedSector]);
  const visibleStockCount = visibleSectors.reduce((count, [, stocks]) => count + stocks.length, 0);
  const currentSectorCount = sectorNames.length;
  const currentUniqueStockCount = uniqueStockCount(sectors);

  function toggleStock(stock: Stock) {
    const key = stockKey(selectedPlanet, stock.symbol);
    setSelectedStocks((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function toggleSector(stocks: Stock[]) {
    const keys = stocks.map((stock) => stockKey(selectedPlanet, stock.symbol));
    const allSelected = keys.length > 0 && keys.every((key) => selectedStocks.has(key));
    setSelectedStocks((current) => {
      const next = new Set(current);
      keys.forEach((key) => (allSelected ? next.delete(key) : next.add(key)));
      return next;
    });
  }

  function selectPlanet(name: string) {
    setSelectedPlanet(name);
    setSelectedSector('All Sectors');
    setSearch('');
  }

  function resetFilters() {
    setSelectedSector('All Sectors');
    setSearch('');
  }

  function clearSelection() {
    setSelectedStocks(new Set());
  }

  function analyzeSelected() {
    if (selectedStocks.size === 0) {
      setMessage('Please select at least one stock.');
      return;
    }
    const selected: SelectedStock[] = [];
    Object.entries(DATA.planets).forEach(([planetName, planetData]) => {
      Object.entries(normalizeSectors(planetData)).forEach(([sector, stocks]) => stocks.forEach((stock) => {
        if (selectedStocks.has(stockKey(planetName, stock.symbol))) selected.push({ ...stock, planet: planetName, sector });
      }));
    });
    setMessage(`${selected.length} stock(s) selected for analysis.`);
  }

  return (
    <main className="container-fluid tool-page planet-mapping-page">
      <header className="page-heading-row">
        <div>
          <div className="eyebrow">FINANCIAL ASTROLOGY</div>
          <h1 className="page-title">Planet Stock Mapping</h1>
          <p className="page-subtitle">Financial Astrology Stock Analysis - {DATA.year}</p>
          <nav className="breadcrumb-line" aria-label="Breadcrumb"><i className="bi bi-house" /> <Link href="/dashboard">Dashboard</Link> <span>/</span> Planet Stock Mapping</nav>
        </div>
      </header>

      <nav className="planet-tabs" aria-label="Planets">{PLANET_NAMES.map((name) => <button className={`planet-tab ${selectedPlanet === name ? 'selected' : ''}`} type="button" key={name} onClick={() => selectPlanet(name)} aria-pressed={selectedPlanet === name}><span className="planet-icon" aria-hidden="true">{DATA.planets[name].icon}</span><span>{name}</span></button>)}</nav>

      {error ? <div className="alert alert-danger" role="alert"><i className="bi bi-exclamation-triangle me-2" />Planet stock mapping data could not be loaded.</div> : loading ? <div className="state-panel mapping-loading" role="status"><span className="spinner-border spinner-border-sm" /> Loading Planet Stock Mapping...</div> : <>
        <section className="filter-panel mapping-filters" aria-labelledby="mapping-filters-title"><div className="filter-title"><span id="mapping-filters-title"><i className="bi bi-funnel" /> Mapping Filters</span><span className="filter-count">{visibleStockCount} visible stocks</span></div><div className="row g-3 align-items-end"><div className="col-12 col-md-3"><label htmlFor="mapping-year">Year</label><input id="mapping-year" value={DATA.year} readOnly aria-readonly="true" /></div><div className="col-12 col-md-4"><label htmlFor="mapping-sector">Sector</label><select id="mapping-sector" value={selectedSector} onChange={(event) => setSelectedSector(event.target.value)}><option>All Sectors</option>{sectorNames.map((sector) => <option value={sector} key={sector}>{formatSectorName(sector)}</option>)}</select></div><div className="col-12 col-md-3"><label htmlFor="mapping-search">Search stock or symbol...</label><div className="filter-search"><i className="bi bi-search" /><input id="mapping-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search stock or symbol..." /></div></div><div className="col-12 col-md-2"><button className="subtle-action w-100" type="button" onClick={resetFilters}><i className="bi bi-arrow-counterclockwise" /> Reset</button></div></div></section>

        <section className="mapping-info-card" aria-labelledby="planet-info-title"><div className="mapping-planet-identity"><span className="mapping-planet-icon" aria-hidden="true">{planet?.icon}</span><div><span className="eyebrow">SELECTED PLANET</span><h2 id="planet-info-title">{selectedPlanet}</h2><p>Traditional Financial Astrology Stock Mapping - {DATA.year}</p></div></div><div className="mapping-stat"><strong>{currentSectorCount}</strong><span>Sectors</span></div><div className="mapping-stat"><strong>{currentUniqueStockCount}</strong><span>Unique Stocks</span></div></section>

        {visibleSectors.length === 0 ? <div className="data-panel mapping-empty"><i className="bi bi-search" /><h2>No stocks found.</h2><p>Try another stock name, symbol, or sector.</p><button className="subtle-action" type="button" onClick={resetFilters}>Reset Filters</button></div> : <section className="sector-grid" aria-label={`${selectedPlanet} stock sectors`}>{visibleSectors.map(([sector, stocks]) => { const keys = stocks.map((stock) => stockKey(selectedPlanet, stock.symbol)); const allSelected = keys.length > 0 && keys.every((key) => selectedStocks.has(key)); return <article className="sector-card" key={sector}><header className="sector-card-header"><div><span className="sector-kicker">SECTOR</span><h2>{formatSectorName(sector)}</h2></div><div className="sector-actions"><span>{stocks.length} Stocks</span><button type="button" className="select-sector-button" onClick={() => toggleSector(stocks)}>{allSelected ? 'Unselect All' : 'Select All'}</button></div></header><div className="stock-list">{stocks.map((stock) => { const key = stockKey(selectedPlanet, stock.symbol); const isSelected = selectedStocks.has(key); return <label className={`stock-item ${isSelected ? 'is-selected' : ''}`} key={key}><input type="checkbox" checked={isSelected} onChange={() => toggleStock(stock)} aria-label={`Select ${stock.name} ${stock.symbol}`} /><span className="stock-check" aria-hidden="true"><i className={`bi ${isSelected ? 'bi-check2' : 'bi-square'}`} /></span><span className="stock-copy"><strong>{stock.name}</strong><small>{stock.symbol}</small></span><span className="exchange-badge">NSE</span></label>; })}</div><footer className="sector-card-footer">{stocks.filter((stock) => selectedStocks.has(stockKey(selectedPlanet, stock.symbol))).length} selected in this sector</footer></article>; })}</section>}
      </>}

      <div className="selection-bar" role="region" aria-label="Stock selection actions"><div><i className="bi bi-check2-square" /><strong>Selected Stocks: {selectedStocks.size}</strong></div><div className="selection-actions"><button className="subtle-action" type="button" onClick={clearSelection} disabled={selectedStocks.size === 0}>Clear Selection</button><button className="gold-action" type="button" onClick={analyzeSelected} disabled={selectedStocks.size === 0} title="Prepare selected stocks for future analysis"><i className="bi bi-bar-chart-line" /> Analyze Selected</button></div></div>
      {message && <div className="toast-message mapping-toast" role="status"><i className="bi bi-info-circle" /><span>{message}</span><button type="button" onClick={() => setMessage('')} aria-label="Dismiss notification"><i className="bi bi-x" /></button></div>}
    </main>
  );
}
