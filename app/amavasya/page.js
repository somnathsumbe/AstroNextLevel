'use client';

import { useEffect, useMemo, useState } from 'react';
import amavasyaData from '@/data/amavasya.json';

const MONTHS = ['All months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const PAGE_SIZES = [10, 25, 50, 100];

function parseDate(value) {
  return new Date(value.replace(' ', 'T'));
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(parseDate(value));
}

function formatTime(value) {
  return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(parseDate(value));
}

function formatDay(value) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'long' }).format(parseDate(value));
}

function festivalText(festival) {
  return Array.isArray(festival) ? festival.join(', ') : festival || '—';
}

function testDateFor(value) {
  const date = parseDate(value);
  const day = date.getDay();
  if (day === 0) date.setDate(date.getDate() + 1);
  if (day === 6) date.setDate(date.getDate() + 2);
  return date;
}

function createRecords() {
  return (amavasyaData.years || []).flatMap((yearData) => (yearData.entries || []).map((entry, index) => {
    const startDate = parseDate(entry.start);
    const testDate = testDateFor(entry.start);
    return {
      id: `${yearData.year}-${entry.start}-${index}`,
      year: yearData.year,
      location: yearData.location,
      tithi: yearData.tithi,
      ...entry,
      date: formatDate(entry.start),
      day: formatDay(entry.start),
      endTime: formatTime(entry.end),
      testDate: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(testDate),
      isWeekend: startDate.getDay() === 0 || startDate.getDay() === 6,
      isTestDay: testDate.getDate() !== startDate.getDate() || testDate.getMonth() !== startDate.getMonth() || testDate.getFullYear() !== startDate.getFullYear(),
      festivalLabel: festivalText(entry.festival),
    };
  }));
}

function downloadCsv(rows) {
  const headers = ['Date', 'Month', 'Start', 'End', 'End Time', 'Day', 'Festival', 'Test Date'];
  const values = rows.map((row) => [row.date, row.month, row.start, row.end, row.endTime, row.day, row.festivalLabel, row.testDate]);
  const csv = [headers, ...values].map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  link.download = 'amavasya-analysis.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function AmavasyaPage() {
  const allRecords = useMemo(createRecords, []);
  const years = useMemo(() => [...new Set(allRecords.map((record) => record.year))].sort((a, b) => b - a), [allRecords]);
  const defaultYear = years.includes(2026) ? 2026 : years[0] || '';
  const [filters, setFilters] = useState({ year: defaultYear, month: 'All months', festival: '', dayType: 'All', search: '' });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 260);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredRecords = useMemo(() => allRecords.filter((record) => {
    const query = appliedFilters.search.trim().toLowerCase();
    const matchesSearch = !query || [record.date, record.month, record.day, record.festivalLabel, record.start, record.end].some((value) => String(value).toLowerCase().includes(query));
    const matchesDay = appliedFilters.dayType === 'All' || (appliedFilters.dayType === 'Weekend' ? record.isWeekend : !record.isWeekend);
    return (!appliedFilters.year || record.year === Number(appliedFilters.year)) && (appliedFilters.month === 'All months' || record.month === appliedFilters.month) && (!appliedFilters.festival || record.festivalLabel.toLowerCase().includes(appliedFilters.festival.toLowerCase())) && matchesDay && matchesSearch;
  }), [allRecords, appliedFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const visibleRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);
  const festivalEvents = filteredRecords.filter((record) => record.festival).length;
  const weekendEvents = filteredRecords.filter((record) => record.isWeekend).length;
  const testDays = filteredRecords.filter((record) => record.isTestDay).length;

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  }

  function resetFilters() {
    const next = { year: defaultYear, month: 'All months', festival: '', dayType: 'All', search: '' };
    setFilters(next);
    setAppliedFilters(next);
    setPage(1);
  }

  function changePage(nextPage) {
    setPage(Math.min(totalPages, Math.max(1, nextPage)));
  }

  return (
    <div className="amavasya-page">
      <div className="page-heading-row">
        <div><div className="eyebrow">LUNAR CYCLE / MARKET OBSERVATION</div><h1 className="page-title">Amavasya Analysis</h1><p className="page-subtitle">Amavasya Calendar &amp; Market Observation</p><div className="breadcrumb-line"><i className="bi bi-house" /> Home <span>/</span> Amavasya</div></div>
        <div className="page-actions"><button className="outline-action" onClick={() => window.print()}><i className="bi bi-printer" /> Print</button><button className="outline-action" onClick={() => downloadCsv(filteredRecords)}><i className="bi bi-download" /> Export CSV</button><button className="outline-action" onClick={() => setModal('rules')}><i className="bi bi-journal-text" /> Trading Rules</button></div>
      </div>

      <form className="filter-panel" onSubmit={applyFilters}>
        <div className="filter-title"><span><i className="bi bi-sliders2" /> Filters</span><span className="filter-count">{filteredRecords.length} records</span></div>
        <div className="row g-3">
          <div className="col-6 col-md-2"><label htmlFor="amavasya-year">Year</label><select id="amavasya-year" value={filters.year} onChange={(event) => updateFilter('year', event.target.value)}>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></div>
          <div className="col-6 col-md-2"><label htmlFor="amavasya-month">Month</label><select id="amavasya-month" value={filters.month} onChange={(event) => updateFilter('month', event.target.value)}>{MONTHS.map((month) => <option key={month}>{month}</option>)}</select></div>
          <div className="col-12 col-md-3"><label htmlFor="amavasya-festival">Festival</label><input id="amavasya-festival" value={filters.festival} onChange={(event) => updateFilter('festival', event.target.value)} placeholder="Search festival" /></div>
          <div className="col-6 col-md-2"><label htmlFor="amavasya-day">Day Type</label><select id="amavasya-day" value={filters.dayType} onChange={(event) => updateFilter('dayType', event.target.value)}><option>All</option><option>Weekday</option><option>Weekend</option></select></div>
          <div className="col-6 col-md-3"><label htmlFor="amavasya-search">Search</label><div className="filter-search"><i className="bi bi-search" /><input id="amavasya-search" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Search records" /></div></div>
        </div>
        <div className="filter-actions"><button className="gold-action" type="submit"><i className="bi bi-check2" /> Apply</button><button className="subtle-action" type="button" onClick={resetFilters}><i className="bi bi-arrow-counterclockwise" /> Reset</button></div>
      </form>

      <div className="row g-3 summary-row">{[['TOTAL AMAVASYA', filteredRecords.length, 'bi-moon-stars', 'gold'], ['SELECTED YEAR', appliedFilters.year || 'All', 'bi-calendar3', 'blue'], ['FESTIVAL EVENTS', festivalEvents, 'bi-stars', 'green'], ['WEEKEND EVENTS', weekendEvents, 'bi-calendar-week', 'purple'], ['TEST DAYS', testDays, 'bi-bezier2', 'orange']].map(([label, value, icon, tone]) => <div className="col-6 col-md-4 col-xl" key={label}><div className="summary-card"><i className={`bi ${icon} summary-icon ${tone}`} /><div className="summary-label">{label}</div><strong>{value}</strong></div></div>)}</div>

      <section className="data-panel"><div className="data-panel-heading"><div><span className="eyebrow">CALENDAR RECORDS</span><h2>Amavasya Dates</h2></div><span className="location-note"><i className="bi bi-geo-alt" /> {allRecords[0]?.location?.city || 'Mumbai'}, {allRecords[0]?.location?.country || 'India'}</span></div>
        {loading ? <div className="state-panel"><span className="spinner-border spinner-border-sm" /> Loading analysis...</div> : visibleRecords.length === 0 ? <div className="state-panel"><i className="bi bi-calendar-x" /><strong>No records found.</strong><span>Try changing your filters.</span></div> : <><div className="table-responsive"><table className="analysis-table"><thead><tr><th>Date</th><th>Month</th><th>Start</th><th>End</th><th>End Time</th><th>Day</th><th>Festival</th><th>Test Date</th><th>Action</th></tr></thead><tbody>{visibleRecords.map((record) => <tr key={record.id}><td><strong>{record.date}</strong></td><td>{record.month}</td><td>{formatTime(record.start)}</td><td>{formatDate(record.end)}</td><td>{record.endTime}</td><td><span className={record.isWeekend ? 'weekend-text' : ''}>{record.day}</span></td><td>{record.festival ? <span className="festival-badge">{record.festivalLabel}</span> : <span className="muted-dash">—</span>}</td><td>{record.testDate}</td><td><button className="view-button" onClick={() => setSelectedRecord(record)} aria-label={`View ${record.date}`}><i className="bi bi-eye" /></button></td></tr>)}</tbody></table></div><div className="pagination-row"><span>Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filteredRecords.length)} of {filteredRecords.length} records</span><div className="pagination-controls"><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} aria-label="Page size">{PAGE_SIZES.map((size) => <option key={size} value={size}>{size} / page</option>)}</select><button disabled={page === 1} onClick={() => changePage(page - 1)} aria-label="Previous page"><i className="bi bi-chevron-left" /></button><span>{page} / {totalPages}</span><button disabled={page === totalPages} onClick={() => changePage(page + 1)} aria-label="Next page"><i className="bi bi-chevron-right" /></button></div></div></>}
      </section>

      {selectedRecord && <div className="modal-backdrop-custom" role="presentation" onClick={() => setSelectedRecord(null)}><div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">AMAVASYA RECORD</span><h2 id="detail-title">{selectedRecord.date}</h2></div><button onClick={() => setSelectedRecord(null)} aria-label="Close details"><i className="bi bi-x-lg" /></button></div><div className="detail-grid"><div><small>MONTH</small><strong>{selectedRecord.month}</strong></div><div><small>DAY</small><strong>{selectedRecord.day}</strong></div><div><small>START</small><strong>{formatTime(selectedRecord.start)}</strong></div><div><small>END</small><strong>{formatDate(selectedRecord.end)} · {selectedRecord.endTime}</strong></div><div><small>FESTIVAL</small><strong>{selectedRecord.festivalLabel}</strong></div><div><small>TEST DATE</small><strong>{selectedRecord.testDate}</strong></div></div><p className="modal-note"><i className="bi bi-info-circle" /> Historical calendar observation for {selectedRecord.location?.city}. This view does not represent a guaranteed financial outcome.</p></div></div>}
      {modal === 'rules' && <div className="modal-backdrop-custom" role="presentation" onClick={() => setModal(null)}><div className="detail-modal rules-modal" role="dialog" aria-modal="true" aria-labelledby="rules-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">MARKET OBSERVATION</span><h2 id="rules-title">Trading Rules</h2></div><button onClick={() => setModal(null)} aria-label="Close trading rules"><i className="bi bi-x-lg" /></button></div><p className="modal-copy">Use Amavasya dates as historical observation points alongside independent market research. The calendar does not calculate or imply support, resistance, OHLC, or guaranteed trading outcomes.</p><ul className="rules-list"><li><i className="bi bi-check2-circle" /> Compare date windows consistently across years.</li><li><i className="bi bi-check2-circle" /> Treat festival and weekday labels as contextual metadata.</li><li><i className="bi bi-check2-circle" /> Validate any investment decision with complete market data and risk controls.</li></ul></div></div>}
    </div>
  );
}
