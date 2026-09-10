'use client';

import { useEffect, useMemo, useState } from 'react';
import panchakData from '@/data/panchak.json';
import { PANCHAK_MONTHS, buildPanchakRow, dateKey, formatDisplayDate, parseDateOnly } from '@/lib/panchak-utils';

const PAGE_SIZE = 5;
const todayKey = () => new Date().toISOString().slice(0, 10);

function downloadCsv(rows, year) {
  const headers = ['Year', 'Month', 'Start Date', 'Start Time', 'End Date', 'End Time', 'Day', 'Market Status', 'Test Date'];
  const values = rows.map((row) => [row.year, row.month, row.startDateFormatted, row.startTime, row.endDateFormatted, row.endTime, row.startDay, row.marketStatus, row.testDate]);
  const csv = [headers, ...values].map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  link.download = `panchak-${year}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function PanchakPage() {
  const records = useMemo(() => panchakData.map((entry, index) => buildPanchakRow(entry, index)), []);
  const years = useMemo(() => [...new Set(records.map((record) => record.year))].sort((a, b) => a - b), [records]);
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
    const searchable = [record.year, record.month, record.start, record.end, record.startDateFormatted, record.startTimeFormatted, record.startDay].join(' ').toLowerCase();
    return record.year === Number(year) && (month === 'All Months' || record.month === month) && (!query || searchable.includes(query));
  }), [records, year, month, appliedSearch]);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const visibleRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const weekendStarts = filteredRecords.filter((record) => record.marketStatus === 'WEEKEND').length;
  const nextPanchak = records.filter((record) => record.startDateKey >= todayKey()).sort((a, b) => a.startDateTime - b.startDateTime)[0];
  const daysRemaining = nextPanchak ? Math.max(0, Math.ceil((nextPanchak.startDateTime - parseDateOnly(todayKey())) / 86400000)) : null;

  function changeYear(value) { setYear(Number(value)); setPage(1); }
  function changeMonth(value) { setMonth(value); setPage(1); }
  function submitSearch(event) { event.preventDefault(); setAppliedSearch(search); setPage(1); }
  function clearSearch() { setSearch(''); setAppliedSearch(''); setPage(1); }
  function shiftMonth(direction) {
    const currentIndex = month === 'All Months' ? (direction < 0 ? 0 : 12) : PANCHAK_MONTHS.indexOf(month) - 1;
    const nextIndex = (currentIndex + direction + 12) % 12;
    setMonth(PANCHAK_MONTHS[nextIndex + 1]);
    setPage(1);
  }
  function resetFilters() { setYear(defaultYear); setMonth('All Months'); clearSearch(); }

  return (
    <div className="panchak-page">
      <div className="page-heading-row"><div><div className="eyebrow">ASTRO TOOL</div><h1 className="page-title">Panchak</h1><p className="page-subtitle">Panchak Start Timings &amp; Market Observation</p><div className="breadcrumb-line"><i className="bi bi-house" /> Dashboard <span>/</span> Panchak</div></div><div className="page-actions"><button className="outline-action" type="button" onClick={() => setModal('use')}><i className="bi bi-question-circle" /> Use</button><button className="outline-action" type="button" onClick={() => window.print()}><i className="bi bi-printer" /> Print</button><button className="outline-action" type="button" onClick={() => downloadCsv(filteredRecords, year)}><i className="bi bi-download" /> Export CSV</button></div></div>
      <form className="filter-panel" onSubmit={submitSearch}><div className="filter-title"><span><i className="bi bi-sliders2" /> Panchak Filters</span><span className="filter-count">{filteredRecords.length} records</span></div><div className="row g-3 align-items-end"><div className="col-12 col-md-3"><label htmlFor="panchak-year">Year</label><select id="panchak-year" value={year} onChange={(event) => changeYear(event.target.value)}>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select></div><div className="col-12 col-md-3"><label htmlFor="panchak-month">Month</label><div className="month-navigation"><button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month"><i className="bi bi-chevron-left" /></button><select id="panchak-month" value={month} onChange={(event) => changeMonth(event.target.value)}>{PANCHAK_MONTHS.map((item) => <option key={item}>{item}</option>)}</select><button type="button" onClick={() => shiftMonth(1)} aria-label="Next month"><i className="bi bi-chevron-right" /></button></div></div><div className="col-12 col-md-4"><label htmlFor="panchak-search">Search Panchak...</label><div className="filter-search"><i className="bi bi-search" /><input id="panchak-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Year, month, date, time or day" /></div></div><div className="col-12 col-md-2"><div className="filter-actions panchak-filter-actions"><button className="gold-action" type="submit"><i className="bi bi-eye" /> Show Details</button><button className="subtle-action" type="button" onClick={clearSearch}>Clear</button></div></div></div></form>

      <div className="row g-3 summary-row">{[['SELECTED YEAR', year, 'bi-calendar3', 'gold'], ['PANCHAK EVENTS', filteredRecords.length, 'bi-calendar-event', 'blue'], ['WEEKEND STARTS', weekendStarts, 'bi-calendar-week', 'orange'], ['WEEKDAY STARTS', filteredRecords.length - weekendStarts, 'bi-calendar-check', 'green'], ['NEXT PANCHAK', nextPanchak ? nextPanchak.startDateFormatted : '—', 'bi-arrow-right-circle', 'purple']].map(([label, value, icon, tone]) => <div className="col-6 col-md-4 col-xl" key={label}><div className="summary-card"><i className={`bi ${icon} summary-icon ${tone}`} /><div className="summary-label">{label}</div><strong>{value}</strong></div></div>)}</div>

      <section className="next-panchak-card"><div><span className="eyebrow">UPCOMING CALENDAR EVENT</span><h2><i className="bi bi-calendar2-event" /> Next Panchak</h2><p>{nextPanchak ? `${nextPanchak.startDateFormatted} · ${nextPanchak.startTimeFormatted} to ${nextPanchak.endDateFormatted} · ${nextPanchak.endTimeFormatted}` : 'No upcoming Panchak event available.'}</p></div>{nextPanchak && <div className="days-remaining"><strong>{daysRemaining}</strong><span>days remaining</span></div>}</section>

      <section className="data-panel"><div className="data-panel-heading"><div><span className="eyebrow">CALENDAR RECORDS / WEEKDAY CLASSIFICATION</span><h2>Panchak Dates</h2></div><span className="location-note">Mumbai, Maharashtra, India · Asia/Kolkata</span></div>{error ? <div className="state-panel"><i className="bi bi-exclamation-triangle" /><strong>Panchak data could not be loaded.</strong><button className="subtle-action" type="button" onClick={() => setError(false)}>Retry</button></div> : loading ? <div className="state-panel"><span className="spinner-border spinner-border-sm" /> Loading Panchak data...</div> : visibleRecords.length === 0 ? <div className="state-panel"><i className="bi bi-calendar-x" /><strong>No Panchak data is available for {year}.</strong><button className="subtle-action" type="button" onClick={resetFilters}>Reset Filters</button></div> : <><div className="table-responsive"><table className="analysis-table panchak-table"><thead><tr><th>#</th><th>Year</th><th>Month</th><th>Start Date</th><th>Start Time</th><th>Day</th><th>Market Status</th><th>Test Date</th><th>Action</th></tr></thead><tbody>{visibleRecords.map((record, index) => <tr className={record.marketStatus === 'WEEKEND' ? 'weekend-row' : ''} key={record.index}><td>{(page - 1) * PAGE_SIZE + index + 1}</td><td>{record.year}</td><td>{record.month}</td><td><strong>{record.startDateFormatted}</strong></td><td>{record.startTimeFormatted}</td><td>{record.marketStatus === 'WEEKEND' ? <span className="weekend-cell">{record.startDay}<small>WEEKEND</small></span> : record.startDay}</td><td><span className={`status-badge ${record.marketStatus === 'WEEKEND' ? 'weekend-status' : 'trading-status'}`}>{record.marketStatus}</span></td><td>{record.testDate !== '-' ? <span title="Next trading day">{record.testDate}</span> : '-'}</td><td><button className="view-button" type="button" onClick={() => setSelectedRecord(record)} aria-label={`View ${record.startDateFormatted}`}><i className="bi bi-eye" /></button></td></tr>)}</tbody></table></div><div className="pagination-row"><span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length} records</span>{totalPages > 1 && <div className="pagination-controls"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><i className="bi bi-chevron-left" /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button type="button" className={page === number ? 'current-page' : ''} key={number} onClick={() => setPage(number)}>{number}</button>)}<button type="button" disabled={page === totalPages} onClick={() => setPage(page + 1)} aria-label="Next page"><i className="bi bi-chevron-right" /></button></div>}</div></>}</section>

      {selectedRecord && <div className="modal-backdrop-custom" role="presentation" onClick={() => setSelectedRecord(null)}><div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="panchak-detail-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">PANCHAK DETAILS</span><h2 id="panchak-detail-title">{selectedRecord.startDateFormatted}</h2></div><button type="button" onClick={() => setSelectedRecord(null)} aria-label="Close details"><i className="bi bi-x-lg" /></button></div><div className="detail-grid"><div><small>YEAR / MONTH</small><strong>{selectedRecord.year} · {selectedRecord.month}</strong></div><div><small>START DAY / STATUS</small><strong>{selectedRecord.startDay} · {selectedRecord.marketStatus}</strong></div><div><small>START</small><strong>{selectedRecord.startDateFormatted} · {selectedRecord.startTimeFormatted}</strong></div><div><small>END</small><strong>{selectedRecord.endDateFormatted} · {selectedRecord.endTimeFormatted}</strong></div><div><small>END DAY</small><strong>{selectedRecord.endDay}</strong></div><div><small>TEST DATE</small><strong>{selectedRecord.testDate}</strong></div><div><small>LOCATION</small><strong>Mumbai, Maharashtra, India</strong></div><div><small>TIMEZONE</small><strong>Asia/Kolkata</strong></div></div><p className="modal-note"><i className="bi bi-info-circle" /> Market Status means weekday/weekend classification only. NSE/BSE holidays are not included.</p></div></div>}
      {modal === 'use' && <div className="modal-backdrop-custom" role="presentation" onClick={() => setModal(null)}><div className="detail-modal rules-modal" role="dialog" aria-modal="true" aria-labelledby="panchak-use-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">MARKET OBSERVATION</span><h2 id="panchak-use-title">⭐ PANCHAK</h2><p className="modal-subtitle">Potential Market Observation Window</p></div><button type="button" onClick={() => setModal(null)} aria-label="Close usage"><i className="bi bi-x-lg" /></button></div><h3 className="modal-section-title">काय पाहायचे?</h3><ul className="rules-list"><li>Panchak Start Date, Start Time आणि End Date</li><li>त्या वेळचा NIFTY 15-Min Candle</li><li>Market Trend आणि Swing High / Swing Low</li><li>Support / Resistance आणि Breakout / Reversal Confirmation</li></ul><h3 className="modal-section-title">Market Downtrend</h3><p className="modal-copy">Low formation, bullish reversal confirmation, volume confirmation आणि follow-through observe करा.</p><h3 className="modal-section-title">Market Uptrend</h3><p className="modal-copy">High formation, bearish reversal confirmation, volume confirmation आणि follow-through observe करा.</p><div className="warning-note"><strong>Panchak = Observation / Alert</strong><span>Technical Confirmation = Entry Signal</span><b>Blind Buy/Sell करू नका.</b></div></div></div>}
    </div>
  );
}
