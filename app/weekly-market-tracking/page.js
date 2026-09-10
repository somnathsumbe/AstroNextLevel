'use client';

import { useEffect, useMemo, useState } from 'react';
import weeklyData from '@/data/weekly-market-tracking.json';
import { MARKET_MONTHS, buildMarketRow, formatLongDate, parseDateOnly } from '@/lib/weekly-market-utils';

const PAGE_SIZE = 10;
const todayKey = () => new Date().toISOString().slice(0, 10);

function downloadCsv(rows) {
  const headers = ['Target Degree', 'Crossing Date', 'Day', 'Observation Time', 'Observed Degree'];
  const values = rows.map((row) => [row.targetDegree, row.dateLabel, row.day, row.observationTime, row.observedDegree.toFixed(6)]);
  const csv = [headers, ...values].map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  link.download = 'jupiter-venus-tracking.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function JupiterVenusTrackingPage() {
  const records = useMemo(() => weeklyData.flatMap((yearData) => yearData.events.map((event, index) => buildMarketRow(yearData.year, event, index))), []);
  const years = useMemo(() => [...new Set(records.map((record) => record.year))], [records]);
  const currentYear = new Date().getFullYear();
  const defaultYear = years.includes(currentYear) ? currentYear : years[years.length - 1];
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState('All Months');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 260);
    const closeOnEscape = (event) => { if (event.key === 'Escape') { setModal(null); setSelectedRecord(null); } };
    document.addEventListener('keydown', closeOnEscape);
    return () => { window.clearTimeout(timer); document.removeEventListener('keydown', closeOnEscape); };
  }, []);

  const filteredRecords = useMemo(() => records.filter((record) => {
    const query = appliedSearch.trim().toLowerCase();
    const searchable = [record.targetDegree, record.crossingDate, record.dateLabel, record.day, record.observationTime, record.observedDegree].join(' ').toLowerCase();
    return record.year === Number(year) && (month === 'All Months' || record.month === month) && (!query || searchable.includes(query));
  }), [records, year, month, appliedSearch]);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const visibleRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const nextEvent = records.filter((record) => record.crossingDate >= todayKey() && record.year === Number(year)).sort((a, b) => a.date - b.date)[0];
  const degreeCounts = [0, 45, 90, 180].map((degree) => filteredRecords.filter((record) => record.targetDegree === degree).length);

  function changeYear(value) { setYear(Number(value)); setPage(1); }
  function changeMonth(value) { setMonth(value); setPage(1); }
  function submitSearch(event) { event.preventDefault(); setAppliedSearch(search); setPage(1); }
  function clearSearch() { setSearch(''); setAppliedSearch(''); setPage(1); }
  function shiftMonth(direction) {
    const currentIndex = month === 'All Months' ? (direction < 0 ? 0 : 12) : MARKET_MONTHS.indexOf(month) - 1;
    const nextIndex = (currentIndex + direction + 12) % 12;
    setMonth(MARKET_MONTHS[nextIndex + 1]);
    setPage(1);
  }

  return (
    <div className="weekly-market-page"><div className="page-heading-row"><div><div className="eyebrow">MARKET TOOL</div><h1 className="page-title">Jupiter Venus Tracking</h1><p className="page-subtitle">Jupiter/Venus Degree Crossing &amp; Market Observation</p><div className="breadcrumb-line"><i className="bi bi-house" /> Dashboard <span>/</span> Jupiter Venus Tracking</div></div><div className="page-actions"><button className="outline-action" type="button" onClick={() => setModal('use')}><i className="bi bi-question-circle" /> Use / How to Use</button><button className="outline-action" type="button" onClick={() => window.print()}><i className="bi bi-printer" /> Print</button><button className="outline-action" type="button" onClick={() => downloadCsv(filteredRecords)}><i className="bi bi-download" /> Export CSV</button></div></div>
      <form className="filter-panel" onSubmit={submitSearch}><div className="filter-title"><span><i className="bi bi-sliders2" /> Market Event Filters</span><span className="filter-count">{filteredRecords.length} records</span></div><div className="row g-3 align-items-end"><div className="col-12 col-md-3"><label htmlFor="weekly-year">Year</label><select id="weekly-year" value={year} onChange={(event) => changeYear(event.target.value)}>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select></div><div className="col-12 col-md-3"><label htmlFor="weekly-month">Month</label><div className="month-navigation"><button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month"><i className="bi bi-chevron-left" /></button><select id="weekly-month" value={month} onChange={(event) => changeMonth(event.target.value)}>{MARKET_MONTHS.map((item) => <option key={item}>{item}</option>)}</select><button type="button" onClick={() => shiftMonth(1)} aria-label="Next month"><i className="bi bi-chevron-right" /></button></div></div><div className="col-12 col-md-4"><label htmlFor="weekly-search">Search degree, date, day...</label><div className="filter-search"><i className="bi bi-search" /><input id="weekly-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Degree, date, day or observed degree" /></div></div><div className="col-12 col-md-2"><div className="filter-actions weekly-filter-actions"><button className="gold-action" type="submit"><i className="bi bi-search" /> Show Details</button><button className="subtle-action" type="button" onClick={clearSearch}>Clear</button></div></div></div></form>
      <div className="row g-3 summary-row">{[['SELECTED YEAR', year, 'bi-calendar3', 'gold'], ['TOTAL EVENTS', filteredRecords.length, 'bi-bar-chart-line', 'blue'], ['0° EVENTS', degreeCounts[0], 'bi-bullseye', 'green'], ['45° EVENTS', degreeCounts[1], 'bi-bullseye', 'purple'], ['90° EVENTS', degreeCounts[2], 'bi-bullseye', 'orange'], ['180° EVENTS', degreeCounts[3], 'bi-bullseye', 'gold']].map(([label, value, icon, tone]) => <div className="col-6 col-md-4 col-xl-2" key={label}><div className="summary-card"><i className={`bi ${icon} summary-icon ${tone}`} /><div className="summary-label">{label}</div><strong>{value}</strong></div></div>)}</div>
      <section className="next-degree-card"><div><span className="eyebrow">UPCOMING DEGREE CROSSING</span><h2><i className="bi bi-bullseye" /> Next Degree Crossing</h2>{nextEvent ? <p><strong>{nextEvent.targetDegree}°</strong> · {nextEvent.dateLabel} · {nextEvent.day} · {nextEvent.observationTime} · {nextEvent.observedDegree.toFixed(6)}°</p> : <p>No upcoming event available for this year.</p>}</div></section>
      <section className="data-panel"><div className="data-panel-heading"><div><span className="eyebrow">MARKET EVENTS / REFERENCE CALENDAR</span><h2>Market events for {year}</h2></div><span className="location-note">Degree crossing observation data</span></div>{error ? <div className="state-panel"><i className="bi bi-exclamation-triangle" /><strong>Weekly market data could not be loaded.</strong><button className="subtle-action" type="button" onClick={() => setError(false)}>Retry</button></div> : loading ? <div className="state-panel"><span className="spinner-border spinner-border-sm" /> Loading market data...</div> : visibleRecords.length === 0 ? <div className="state-panel"><i className="bi bi-calendar-x" /><strong>Jupiter Venus Tracking</strong><span>No market events available for the selected year.</span><button className="subtle-action" type="button" onClick={clearSearch}>Clear Filters</button></div> : <><div className="table-responsive"><table className="analysis-table weekly-table"><caption className="visually-hidden">Market events for {year}</caption><thead><tr><th>#</th><th>Target Degree</th><th>Crossing Date</th><th>Day</th><th>Observation Time</th><th>Observed Degree</th><th>Action</th></tr></thead><tbody>{visibleRecords.map((record, index) => <tr className={record.weekend ? 'weekend-row' : ''} key={record.id}><td>{(page - 1) * PAGE_SIZE + index + 1}</td><td><span className="degree-badge">{record.targetDegree}°</span></td><td><strong>{record.dateLabel}</strong></td><td>{record.weekend ? <span className="weekend-cell">{record.day}<small>WEEKEND</small></span> : record.day}</td><td>{record.observationTime}</td><td>{record.observedDegree.toFixed(6)}°</td><td><button className="view-button" type="button" onClick={() => setSelectedRecord(record)} aria-label={`View ${record.dateLabel}`}><i className="bi bi-eye" /></button></td></tr>)}</tbody></table></div><div className="pagination-row"><span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length} records</span>{totalPages > 1 && <div className="pagination-controls"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><i className="bi bi-chevron-left" /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button type="button" className={page === number ? 'current-page' : ''} key={number} onClick={() => setPage(number)}>{number}</button>)}<button type="button" disabled={page === totalPages} onClick={() => setPage(page + 1)} aria-label="Next page"><i className="bi bi-chevron-right" /></button></div>}</div></>}</section>
      <section className="data-panel weekly-observation"><div className="data-panel-heading"><div><span className="eyebrow">MARKET OBSERVATION</span><h2>Degree Crossing = Observation Point</h2></div><i className="bi bi-info-circle" /></div><p className="modal-copy">This dataset represents degree-crossing dates and can be used as an observation/reference calendar. Weekend dates should be considered separately because regular market sessions are different. Degree crossing alone must not be treated as a confirmed Buy/Sell signal.</p><p className="modal-note"><i className="bi bi-shield-check" /> Technical confirmation is required before making any trading decision. No GapUp/GapDown, Support, Resistance, OHLC or trading signal is calculated from this JSON.</p></section>
      {selectedRecord && <div className="modal-backdrop-custom" role="presentation" onClick={() => setSelectedRecord(null)}><div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="degree-crossing-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">DEGREE CROSSING DETAILS</span><h2 id="degree-crossing-title">Degree Crossing Details</h2></div><button type="button" onClick={() => setSelectedRecord(null)} aria-label="Close details"><i className="bi bi-x-lg" /></button></div><div className="detail-grid"><div><small>TARGET DEGREE</small><strong>{selectedRecord.targetDegree}°</strong></div><div><small>CROSSING DATE</small><strong>{selectedRecord.dateLabel}</strong></div><div><small>DAY / STATUS</small><strong>{selectedRecord.day} · {selectedRecord.weekend ? 'Weekend' : 'Weekday'}</strong></div><div><small>OBSERVATION TIME</small><strong>{selectedRecord.observationTime}</strong></div><div><small>OBSERVED DEGREE</small><strong>{selectedRecord.observedDegree.toFixed(6)}°</strong></div><div><small>YEAR</small><strong>{selectedRecord.year}</strong></div></div><p className="modal-note"><i className="bi bi-info-circle" /> No market OHLC data is attached to this event. It remains an observation/reference point.</p></div></div>}
      {modal === 'use' && <div className="modal-backdrop-custom" role="presentation" onClick={() => setModal(null)}><div className="detail-modal rules-modal" role="dialog" aria-modal="true" aria-labelledby="degree-use-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">MARKET TOOL</span><h2 id="degree-use-title">How to use Jupiter Venus Tracking</h2></div><button type="button" onClick={() => setModal(null)} aria-label="Close usage"><i className="bi bi-x-lg" /></button></div><ol className="rules-list degree-steps"><li>Select the required year.</li><li>Click Show Details.</li><li>Review Target Degree and Crossing Date.</li><li>Check Observation Time and Observed Degree.</li><li>Compare the event with actual market-session data.</li><li>Use technical confirmation before interpreting market movement.</li></ol><div className="warning-note"><strong>Do not use degree crossing alone as a Buy/Sell signal.</strong></div></div></div>}
    </div>
  );
}
