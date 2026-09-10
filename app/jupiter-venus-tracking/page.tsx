'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import rawData from '@/src/data/weekly-market-tracking.json';
import { exportMarketCsv } from '@/src/lib/export-utils';
import { dateKey, formatLongDate, isWeekend, monthName } from '@/src/lib/date-utils';
import type { MarketEvent, MarketRecord, MarketYear } from '@/src/types/weekly-market-tracking';

const PAGE_SIZE = 10;
const MONTHS = ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DATA = rawData as MarketYear[];

function toRecords(yearData: MarketYear): MarketRecord[] {
  return yearData.events.map((event: MarketEvent, index) => ({
    ...event,
    year: yearData.year,
    dateLabel: formatLongDate(event.crossingDate),
    month: monthName(event.crossingDate),
    weekend: isWeekend(event.day),
    id: `${yearData.year}-${event.crossingDate}-${index}`,
  }));
}

export default function JupiterVenusTrackingPage() {
  const records = useMemo(() => DATA.flatMap(toRecords), []);
  const years = useMemo(() => DATA.map(({ year }) => year), []);
  const initialYear = years.includes(new Date().getFullYear()) ? new Date().getFullYear() : years[years.length - 1];
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [month, setMonth] = useState('All Months');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [details, setDetails] = useState<MarketRecord | null>(null);
  const [showUsage, setShowUsage] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDetails(null);
        setShowUsage(false);
      }
    };
    document.addEventListener('keydown', close);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', close);
    };
  }, []);

  const yearRecords = useMemo(() => records.filter((record) => record.year === selectedYear), [records, selectedYear]);
  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return yearRecords.filter((record) => {
      const searchable = [record.targetDegree, record.crossingDate, record.dateLabel, record.day, record.observationTime, record.observedDegree].join(' ').toLowerCase();
      return (month === 'All Months' || record.month === month) && (!query || searchable.includes(query));
    });
  }, [yearRecords, month, search]);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const visibleRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const nextEvent = yearRecords.filter((record) => dateKey(record.crossingDate) >= dateKey(new Date().toISOString().slice(0, 10))).sort((a, b) => dateKey(a.crossingDate) - dateKey(b.crossingDate))[0];
  const degreeCounts = [0, 45, 90, 180].map((degree) => yearRecords.filter((record) => record.targetDegree === degree).length);

  function resetPage() { setPage(1); }
  function changeYear(value: string) { setSelectedYear(Number(value)); resetPage(); }
  function changeMonth(value: string) { setMonth(value); resetPage(); }
  function shiftMonth(direction: number) {
    const current = MONTHS.indexOf(month);
    const next = current === 0 ? (direction > 0 ? 1 : 12) : ((current - 1 + direction + 12) % 12) + 1;
    setMonth(MONTHS[next]);
    resetPage();
  }

  return (
    <main className="container-fluid tool-page weekly-market-page">
      <header className="page-heading-row">
        <div>
          <div className="eyebrow">MARKET TOOL</div>
          <h1 className="page-title">Jupiter Venus Tracking</h1>
          <p className="page-subtitle">Jupiter/Venus Degree Crossing &amp; Market Observation</p>
          <nav className="breadcrumb-line" aria-label="Breadcrumb"><i className="bi bi-house" /> <Link href="/dashboard">Dashboard</Link> <span>/</span> Jupiter Venus Tracking</nav>
        </div>
        <div className="page-actions">
          <button className="outline-action" type="button" onClick={() => setShowUsage(true)}><i className="bi bi-question-circle" /> Use / How to Use</button>
          <button className="outline-action" type="button" onClick={() => window.print()}><i className="bi bi-printer" /> Print</button>
          <button className="outline-action" type="button" onClick={() => exportMarketCsv(filteredRecords)}><i className="bi bi-download" /> Export CSV</button>
        </div>
      </header>

      <form className="filter-panel" onSubmit={(event) => { event.preventDefault(); resetPage(); setLoading(true); window.setTimeout(() => setLoading(false), 250); }}>
        <div className="filter-title"><span><i className="bi bi-sliders2" /> Market Event Filters</span><span className="filter-count">{filteredRecords.length} records</span></div>
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-3"><label htmlFor="market-year">Year</label><select id="market-year" value={selectedYear} onChange={(event) => changeYear(event.target.value)}>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></div>
          <div className="col-12 col-md-3"><label htmlFor="market-month">Month</label><div className="month-navigation"><button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month"><i className="bi bi-chevron-left" /></button><select id="market-month" value={month} onChange={(event) => changeMonth(event.target.value)}>{MONTHS.map((item) => <option key={item}>{item}</option>)}</select><button type="button" onClick={() => shiftMonth(1)} aria-label="Next month"><i className="bi bi-chevron-right" /></button></div></div>
          <div className="col-12 col-md-4"><label htmlFor="market-search">Search degree, date, day...</label><div className="filter-search"><i className="bi bi-search" /><input id="market-search" value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} placeholder="Search degree, date, day..." /></div></div>
          <div className="col-12 col-md-2"><div className="filter-actions weekly-filter-actions"><button className="gold-action" type="submit" disabled={loading}><i className="bi bi-search" /> {loading ? 'Loading...' : 'Show Details'}</button><button className="subtle-action" type="button" onClick={() => { setSearch(''); setMonth('All Months'); resetPage(); }}>Clear</button></div></div>
        </div>
      </form>

      <section className="row g-3 summary-row" aria-label="Year summary">
        {[['SELECTED YEAR', selectedYear, 'bi-calendar3', 'gold'], ['TOTAL EVENTS', yearRecords.length, 'bi-bar-chart-line', 'blue'], ['0° EVENTS', degreeCounts[0], 'bi-bullseye', 'green'], ['45° EVENTS', degreeCounts[1], 'bi-bullseye', 'purple'], ['90° EVENTS', degreeCounts[2], 'bi-bullseye', 'orange'], ['180° EVENTS', degreeCounts[3], 'bi-bullseye', 'gold']].map(([label, value, icon, tone]) => <div className="col-6 col-md-4 col-xl-2" key={String(label)}><article className="summary-card"><i className={`bi ${icon} summary-icon ${tone}`} /><div className="summary-label">{label}</div><strong>{value}</strong></article></div>)}
      </section>

      <section className="next-degree-card" aria-labelledby="next-crossing-title"><div><span className="eyebrow">UPCOMING DEGREE CROSSING</span><h2 id="next-crossing-title"><i className="bi bi-bullseye" /> Next Degree Crossing</h2>{nextEvent ? <div className="detail-grid compact"><div><small>TARGET DEGREE</small><strong>{nextEvent.targetDegree}°</strong></div><div><small>CROSSING DATE</small><strong>{nextEvent.dateLabel}</strong></div><div><small>DAY</small><strong>{nextEvent.day}</strong></div><div><small>OBSERVATION TIME</small><strong>{nextEvent.observationTime}</strong></div><div><small>OBSERVED DEGREE</small><strong>{nextEvent.observedDegree.toFixed(6)}°</strong></div></div> : <p>No upcoming event available for this year.</p>}</div></section>

      <section className="data-panel" aria-labelledby="events-title"><div className="data-panel-heading"><div><span className="eyebrow">MARKET EVENTS / REFERENCE CALENDAR</span><h2 id="events-title">Market events for {selectedYear}</h2></div><span className="location-note">Degree crossing observation data</span></div>
        {error ? <div className="state-panel" role="alert"><i className="bi bi-exclamation-triangle" /><strong>Weekly market data could not be loaded.</strong><button className="subtle-action" type="button" onClick={() => setError(false)}>Retry</button></div> : loading ? <div className="state-panel" role="status"><span className="spinner-border spinner-border-sm" /> Loading market data...</div> : visibleRecords.length === 0 ? <div className="state-panel"><i className="bi bi-calendar-x" /><strong>Jupiter Venus Tracking</strong><span>No market events available for the selected year.</span><button className="subtle-action" type="button" onClick={() => { setSearch(''); setMonth('All Months'); resetPage(); }}>Clear Filters</button></div> : <>
          <div className="table-responsive"><table className="analysis-table weekly-table"><caption className="visually-hidden">Market events for {selectedYear}</caption><thead><tr><th>#</th><th>Target Degree</th><th>Crossing Date</th><th>Day</th><th>Observation Time</th><th>Observed Degree</th><th>Action</th></tr></thead><tbody>{visibleRecords.map((record, index) => <tr className={record.weekend ? 'weekend-row' : ''} key={record.id}><td>{(page - 1) * PAGE_SIZE + index + 1}</td><td><span className="degree-badge">{record.targetDegree}°</span></td><td><strong>{record.dateLabel}</strong></td><td>{record.day} {record.weekend && <span className="status-badge weekend-status">Weekend</span>}</td><td>{record.observationTime}</td><td>{record.observedDegree.toFixed(6)}°</td><td><button className="view-button" type="button" onClick={() => setDetails(record)} aria-label={`View details for ${record.dateLabel}`}><i className="bi bi-eye" /></button></td></tr>)}</tbody></table></div>
          <div className="pagination-row"><span>Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length}</span><div className="pagination-controls"><button className="subtle-action" type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => <button className={`subtle-action ${page === item ? 'current-page' : ''}`} type="button" key={item} onClick={() => setPage(item)} aria-current={page === item ? 'page' : undefined}>{item}</button>)}<button className="subtle-action" type="button" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button></div></div>
        </>}
      </section>

      <section className="data-panel weekly-observation" aria-labelledby="observation-title"><div className="data-panel-heading"><div><span className="eyebrow">MARKET OBSERVATION</span><h2 id="observation-title">Degree Crossing = Observation Point</h2></div><i className="bi bi-info-circle" /></div><p className="modal-copy">This dataset represents degree-crossing dates and can be used as an observation/reference calendar. Weekend dates should be separately considered because regular market sessions are different.</p><p className="modal-note"><i className="bi bi-shield-check" /> Degree crossing alone must not be treated as a confirmed Buy/Sell signal. Technical confirmation is required before making any trading decision. No GapUp/GapDown, Support, Resistance, OHLC, or trading signals are calculated from this JSON.</p></section>

      {details && <div className="modal-backdrop-custom" role="presentation" onClick={() => setDetails(null)}><div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="details-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">DEGREE CROSSING DETAILS</span><h2 id="details-title">Degree Crossing Details</h2></div><button type="button" onClick={() => setDetails(null)} aria-label="Close details"><i className="bi bi-x-lg" /></button></div><div className="detail-grid"><div><small>TARGET DEGREE</small><strong>{details.targetDegree}°</strong></div><div><small>CROSSING DATE</small><strong>{details.dateLabel}</strong></div><div><small>DAY / STATUS</small><strong>{details.day} · {details.weekend ? 'Weekend' : 'Weekday'}</strong></div><div><small>OBSERVATION TIME</small><strong>{details.observationTime}</strong></div><div><small>OBSERVED DEGREE</small><strong>{details.observedDegree.toFixed(6)}°</strong></div><div><small>YEAR</small><strong>{details.year}</strong></div></div></div></div>}
      {showUsage && <div className="modal-backdrop-custom" role="presentation" onClick={() => setShowUsage(false)}><div className="detail-modal rules-modal" role="dialog" aria-modal="true" aria-labelledby="usage-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">MARKET TOOL</span><h2 id="usage-title">How to use Jupiter Venus Tracking</h2></div><button type="button" onClick={() => setShowUsage(false)} aria-label="Close usage"><i className="bi bi-x-lg" /></button></div><ol className="rules-list degree-steps"><li>Select the required year.</li><li>Click Show Details.</li><li>Review Target Degree and Crossing Date.</li><li>Check Observation Time and Observed Degree.</li><li>Compare the event with actual market-session data.</li><li>Use technical confirmation before interpreting any market movement.</li></ol><div className="warning-note"><strong>Do not use degree crossing alone as a Buy/Sell signal.</strong></div></div></div>}
    </main>
  );
}
