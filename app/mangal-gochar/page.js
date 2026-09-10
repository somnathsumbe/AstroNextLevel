'use client';

import { useEffect, useMemo, useState } from 'react';
import mangalData from '@/data/mangal-gochar.json';
import { MONTHS, buildMangalRow, dateKey, formatDisplayDate, parseDateOnly } from '@/lib/mangal-utils';

const PAGE_SIZE = 10;
const todayKey = () => new Date().toISOString().slice(0, 10);

function downloadCsv(rows, year) {
  const headers = ['Date', 'Previous Date', 'Next Date', 'Day', 'Planet', 'Event', 'Rashi', 'Time', 'Vakri'];
  const values = rows.map((row) => [row.dateLabel, row.previousDateLabel, row.nextDateLabel, row.day, row.planet, row.eventLabel, row.rashi, row.time, row.vakri ? 'Vakri' : 'Direct']);
  const csv = [headers, ...values].map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  link.download = `mangal-gochar-${year}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function MangalGocharPage() {
  const records = useMemo(() => mangalData.flatMap((yearData) => yearData.events.map((event, index) => buildMangalRow(yearData.year, event, index))), []);
  const years = useMemo(() => [...new Set(records.map((record) => record.year))], [records]);
  const currentYear = new Date().getFullYear();
  const defaultYear = years.includes(currentYear) ? currentYear : years[0];
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState('All months');
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
    const searchable = [record.dateLabel, record.day, record.planet, record.eventLabel, record.rashi, record.time].join(' ').toLowerCase();
    return record.year === Number(year) && (month === 'All months' || record.month === month) && (!query || searchable.includes(query));
  }), [records, year, month, appliedSearch]);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const visibleRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const vakriCount = filteredRecords.filter((record) => record.vakri).length;
  const weekendCount = filteredRecords.filter((record) => record.status === 'WEEKEND').length;
  const nextEvent = records.filter((record) => record.date >= todayKey()).sort((a, b) => a.eventDate - b.eventDate)[0];
  const daysRemaining = nextEvent ? Math.max(0, Math.ceil((nextEvent.eventDate - parseDateOnly(todayKey())) / 86400000)) : null;

  function changeYear(value) { setYear(Number(value)); setPage(1); }
  function changeMonth(value) { setMonth(value); setPage(1); }
  function submitSearch(event) { event.preventDefault(); setAppliedSearch(search); setPage(1); }
  function clearSearch() { setSearch(''); setAppliedSearch(''); setPage(1); }

  return (
    <div className="mangal-page">
      <div className="page-heading-row"><div><div className="eyebrow">ASTRO TOOL</div><h1 className="page-title">Mangal Gochar GapUp GapDown</h1><p className="page-subtitle">Mars Transit &amp; Market Observation</p><div className="breadcrumb-line"><i className="bi bi-house" /> Dashboard <span>/</span> Mangal Gochar</div></div><div className="page-actions"><button className="outline-action" type="button" onClick={() => setModal('use')}><i className="bi bi-question-circle" /> Use</button><button className="outline-action" type="button" onClick={() => window.print()}><i className="bi bi-printer" /> Print</button><button className="outline-action" type="button" onClick={() => downloadCsv(filteredRecords, year)}><i className="bi bi-download" /> Export CSV</button></div></div>
      <form className="filter-panel" onSubmit={submitSearch}><div className="filter-title"><span><i className="bi bi-sliders2" /> Mangal Gochar Filters</span><span className="filter-count">{filteredRecords.length} records</span></div><div className="row g-3 align-items-end"><div className="col-12 col-md-3"><label htmlFor="mangal-year">Year</label><select id="mangal-year" value={year} onChange={(event) => changeYear(event.target.value)}>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select></div><div className="col-12 col-md-3"><label htmlFor="mangal-month">Month</label><select id="mangal-month" value={month} onChange={(event) => changeMonth(event.target.value)}>{MONTHS.map((item) => <option key={item}>{item}</option>)}</select></div><div className="col-12 col-md-4"><label htmlFor="mangal-search">Search Mangal Gochar...</label><div className="filter-search"><i className="bi bi-search" /><input id="mangal-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Date, day, event, rashi or time" /></div></div><div className="col-12 col-md-2"><div className="filter-actions mangal-filter-actions"><button className="gold-action" type="submit"><i className="bi bi-search" /> Search</button><button className="subtle-action" type="button" onClick={clearSearch}>Clear</button></div></div></div></form>
      <div className="row g-3 summary-row">{[['SELECTED YEAR', year, 'bi-calendar3', 'gold'], ['TOTAL GOCHAR EVENTS', filteredRecords.length, 'bi-planet', 'blue'], ['VAKRI EVENTS', vakriCount, 'bi-arrow-repeat', 'purple'], ['WEEKEND EVENTS', weekendCount, 'bi-calendar-week', 'orange'], ['NEXT GOCHAR', nextEvent ? nextEvent.dateLabel : '—', 'bi-arrow-right-circle', 'green']].map(([label, value, icon, tone]) => <div className="col-6 col-md-4 col-xl" key={label}><div className="summary-card"><i className={`bi ${icon} summary-icon ${tone}`} /><div className="summary-label">{label}</div><strong>{value}</strong></div></div>)}</div>
      <section className="next-mangal-card"><div><span className="eyebrow">UPCOMING TRANSIT</span><h2><i className="bi bi-fire" /> Next Mangal Gochar</h2><p>{nextEvent ? `${nextEvent.dateLabel} · ${nextEvent.time} · ${nextEvent.rashi} · ${nextEvent.eventLabel}` : 'No upcoming Mangal Gochar available.'}</p>{nextEvent && <span className="status-badge direct-status">{nextEvent.vakri ? 'Vakri' : 'Direct'} · {daysRemaining} days remaining</span>}</div></section>
      <section className="data-panel"><div className="data-panel-heading"><div><span className="eyebrow">TRANSIT RECORDS / CALENDAR OBSERVATION</span><h2>Mangal Gochar Events</h2></div><span className="location-note">Mars Transit · Year {year}</span></div>{error ? <div className="state-panel"><i className="bi bi-exclamation-triangle" /><strong>Mangal Gochar data could not be loaded.</strong><button className="subtle-action" type="button" onClick={() => setError(false)}>Retry</button></div> : loading ? <div className="state-panel"><span className="spinner-border spinner-border-sm" /> Loading Mangal Gochar data...</div> : visibleRecords.length === 0 ? <div className="state-panel"><i className="bi bi-calendar-x" /><strong>No transit records are available for {year}.</strong><button className="subtle-action" type="button" onClick={clearSearch}>Clear Filters</button></div> : <><div className="table-responsive"><table className="analysis-table mangal-table"><thead><tr><th>#</th><th>Date</th><th>Previous Date</th><th>Next Date</th><th>Day</th><th>Planet</th><th>Event</th><th>Rashi</th><th>Time</th><th>Vakri</th><th>Action</th></tr></thead><tbody>{visibleRecords.map((record, index) => <tr className={record.status === 'WEEKEND' ? 'weekend-row' : ''} key={record.id}><td>{(page - 1) * PAGE_SIZE + index + 1}</td><td><strong>{record.dateLabel}</strong></td><td>{record.previousDateLabel}</td><td>{record.nextDateLabel}</td><td>{record.status === 'WEEKEND' ? <span className="weekend-cell">{record.day}<small>WEEKEND</small></span> : record.day}</td><td>{record.planet}</td><td><span className="festival-badge">{record.eventLabel}</span></td><td>{record.rashi}</td><td>{record.time}</td><td><span className={`status-badge ${record.vakri ? 'weekend-status' : 'trading-status'}`}>{record.vakri ? 'Vakri' : 'Direct'}</span></td><td><button className="view-button" type="button" onClick={() => setSelectedRecord(record)} aria-label={`View ${record.dateLabel}`}><i className="bi bi-eye" /></button></td></tr>)}</tbody></table></div><div className="pagination-row"><span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length} records</span>{totalPages > 1 && <div className="pagination-controls"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><i className="bi bi-chevron-left" /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button type="button" className={page === number ? 'current-page' : ''} key={number} onClick={() => setPage(number)}>{number}</button>)}<button type="button" disabled={page === totalPages} onClick={() => setPage(page + 1)} aria-label="Next page"><i className="bi bi-chevron-right" /></button></div>}</div></>}</section>
      <section className="data-panel mangal-observation"><div className="data-panel-heading"><div><span className="eyebrow">OBSERVATION FRAMEWORK</span><h2>GapUp / GapDown Observation</h2></div><i className="bi bi-bar-chart-line" /></div><div className="observation-grid"><div><strong>Previous Date</strong><span>Potential comparison session before Mangal Gochar.</span></div><div><strong>Gochar Date</strong><span>Observe NIFTY/BANKNIFTY opening and intraday movement.</span></div><div><strong>Next Date</strong><span>Observe follow-through after the transit.</span></div></div><p className="modal-note"><i className="bi bi-info-circle" /> Current JSON has no OHLC data. Gap %, Gap Up/Down, volume, reversal and backtest values are not calculated.</p></section>
      {selectedRecord && <div className="modal-backdrop-custom" role="presentation" onClick={() => setSelectedRecord(null)}><div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="mangal-detail-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">MANGAL GOCHAR RECORD</span><h2 id="mangal-detail-title">{selectedRecord.dateLabel}</h2></div><button type="button" onClick={() => setSelectedRecord(null)} aria-label="Close details"><i className="bi bi-x-lg" /></button></div><div className="detail-grid"><div><small>DAY / STATUS</small><strong>{selectedRecord.day} · {selectedRecord.status}</strong></div><div><small>PREVIOUS / NEXT DATE</small><strong>{selectedRecord.previousDateLabel} / {selectedRecord.nextDateLabel}</strong></div><div><small>PLANET / EVENT</small><strong>{selectedRecord.planet} · {selectedRecord.eventLabel}</strong></div><div><small>RASHI / TIME</small><strong>{selectedRecord.rashi} · {selectedRecord.time}</strong></div><div><small>VAKRI</small><strong>{selectedRecord.vakri ? 'Vakri' : 'Direct'}</strong></div></div><p className="modal-note"><i className="bi bi-info-circle" /> Observation only. No market values or confirmed GapUp/GapDown signal is calculated.</p></div></div>}
      {modal === 'use' && <div className="modal-backdrop-custom" role="presentation" onClick={() => setModal(null)}><div className="detail-modal rules-modal" role="dialog" aria-modal="true" aria-labelledby="mangal-use-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">MARKET OBSERVATION</span><h2 id="mangal-use-title">How to use Mangal Gochar</h2></div><button type="button" onClick={() => setModal(null)} aria-label="Close usage"><i className="bi bi-x-lg" /></button></div><ol className="rules-list degree-steps"><li>Select a year.</li><li>Check Mangal Gochar dates.</li><li>Compare the previous trading session, Gochar date and next trading session.</li><li>Observe NIFTY/BANKNIFTY opening gap and 15-minute candles.</li><li>Check trend, swing high/low and volume.</li><li>Confirm reversal/breakout before taking any decision.</li></ol><div className="warning-note"><strong>Mangal Gochar = Observation / Alert</strong><span>Technical Confirmation = Entry Signal</span><b>Blind Buy/Sell करू नका.</b></div></div></div>}
    </div>
  );
}
