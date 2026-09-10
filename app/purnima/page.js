'use client';

import { useEffect, useMemo, useState } from 'react';
import purnimaData from '@/data/purnima.json';
import { MONTHS, parsePurnimaDate, parseTiming, formatDate, formatTime, formatMonth, formatDay, isWeekend, nextMonday, durationBetween } from '@/lib/purnima-utils';

const PAGE_SIZES = [10, 25, 50, 100];
const LOCATION = 'Mumbai, Maharashtra, India';

function createRecords() {
  return Object.entries(purnimaData.years || {}).flatMap(([year, entries]) => entries.map((entry, index) => {
    const eventDate = parsePurnimaDate(entry.date);
    const begins = parseTiming(entry.begins, Number(year));
    const ends = parseTiming(entry.ends, Number(year));
    const weekend = isWeekend(eventDate);
    const testDate = nextMonday(eventDate);
    return {
      id: `${year}-${entry.name}-${index}`,
      year: Number(year),
      name: entry.name,
      eventDate,
      begins,
      ends,
      month: formatMonth(eventDate),
      dateLabel: formatDate(eventDate),
      beginsLabel: `${formatDate(begins)} · ${formatTime(begins)}`,
      endsLabel: `${formatDate(ends)} · ${formatTime(ends)}`,
      endTime: formatTime(ends),
      day: formatDay(eventDate),
      testDate: formatDate(testDate),
      isWeekend: weekend,
      isTestDay: weekend,
      duration: durationBetween(begins, ends),
      isVrat: /vrat/i.test(entry.name),
    };
  }));
}

function downloadCsv(rows) {
  const headers = ['Event', 'Month', 'Date', 'Begins', 'Ends', 'End Time', 'Day', 'Test Date'];
  const values = rows.map((row) => [row.name, row.month, row.dateLabel, row.beginsLabel, row.endsLabel, row.endTime, row.day, row.testDate]);
  const csv = [headers, ...values].map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  link.download = 'purnima-analysis.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function PurnimaPage() {
  const allRecords = useMemo(createRecords, []);
  const years = useMemo(() => [...new Set(allRecords.map((record) => record.year))].sort((a, b) => b - a), [allRecords]);
  const defaultYear = years.includes(2026) ? 2026 : years[0] || '';
  const [filters, setFilters] = useState({ year: defaultYear, month: 'All months', search: '', dayType: 'All' });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modal, setModal] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 260);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredRecords = useMemo(() => allRecords.filter((record) => {
    const query = appliedFilters.search.trim().toLowerCase();
    const matchesSearch = !query || [record.name, record.month, record.dateLabel, record.day].some((value) => value.toLowerCase().includes(query));
    const matchesDay = appliedFilters.dayType === 'All' || (appliedFilters.dayType === 'Weekend' ? record.isWeekend : !record.isWeekend);
    return (!appliedFilters.year || record.year === Number(appliedFilters.year)) && (appliedFilters.month === 'All months' || record.month === appliedFilters.month) && matchesDay && matchesSearch;
  }), [allRecords, appliedFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const visibleRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);
  const festivalEvents = filteredRecords.filter((record) => record.isVrat).length;
  const weekendEvents = filteredRecords.filter((record) => record.isWeekend).length;
  const testDays = filteredRecords.filter((record) => record.isTestDay).length;

  function updateFilter(name, value) { setFilters((current) => ({ ...current, [name]: value })); }
  function applyFilters(event) { event.preventDefault(); setPage(1); setAppliedFilters(filters); }
  function resetFilters() { const next = { year: defaultYear, month: 'All months', search: '', dayType: 'All' }; setFilters(next); setAppliedFilters(next); setPage(1); }
  function changePage(nextPage) { setPage(Math.min(totalPages, Math.max(1, nextPage))); }

  return (
    <div className="purnima-page">
      <div className="page-heading-row"><div><div className="eyebrow">LUNAR CYCLE / MARKET OBSERVATION</div><h1 className="page-title">Purnima Analysis</h1><p className="page-subtitle">Purnima Calendar &amp; Market Observation</p><div className="breadcrumb-line"><i className="bi bi-house" /> Home <span>/</span> Purnima</div><div className="location-note purnima-location"><i className="bi bi-geo-alt" /> {LOCATION} · {purnimaData.timezone}</div></div><div className="page-actions"><button className="outline-action" type="button" onClick={() => window.print()}><i className="bi bi-printer" /> Print</button><button className="outline-action" type="button" onClick={() => downloadCsv(filteredRecords)}><i className="bi bi-download" /> Export CSV</button><button className="outline-action" type="button" onClick={() => setModal('rules')}><i className="bi bi-journal-text" /> Trading Rules</button></div></div>

      <form className="filter-panel" onSubmit={applyFilters}><div className="filter-title"><span><i className="bi bi-sliders2" /> Filters</span><span className="filter-count">{filteredRecords.length} records</span></div><div className="row g-3"><div className="col-6 col-md-3"><label htmlFor="purnima-year">Year</label><select id="purnima-year" value={filters.year} onChange={(event) => updateFilter('year', event.target.value)}>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></div><div className="col-6 col-md-3"><label htmlFor="purnima-month">Month</label><select id="purnima-month" value={filters.month} onChange={(event) => updateFilter('month', event.target.value)}>{MONTHS.map((month) => <option key={month}>{month}</option>)}</select></div><div className="col-12 col-md-3"><label htmlFor="purnima-search">Purnima / Festival / Event</label><div className="filter-search"><i className="bi bi-search" /><input id="purnima-search" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Search events" /></div></div><div className="col-6 col-md-3"><label htmlFor="purnima-day">Day Type</label><select id="purnima-day" value={filters.dayType} onChange={(event) => updateFilter('dayType', event.target.value)}><option>All</option><option>Weekday</option><option>Weekend</option></select></div></div><div className="filter-actions"><button className="gold-action" type="submit"><i className="bi bi-check2" /> Apply</button><button className="subtle-action" type="button" onClick={resetFilters}><i className="bi bi-arrow-counterclockwise" /> Reset</button></div></form>

      <div className="row g-3 summary-row">{[['TOTAL PURNIMA EVENTS', filteredRecords.length, 'bi-moon-stars', 'gold'], ['SELECTED YEAR', appliedFilters.year || 'All', 'bi-calendar3', 'blue'], ['FESTIVAL / VRAT EVENTS', festivalEvents, 'bi-stars', 'green'], ['WEEKEND EVENTS', weekendEvents, 'bi-calendar-week', 'purple'], ['TEST DAYS', testDays, 'bi-bezier2', 'orange']].map(([label, value, icon, tone]) => <div className="col-6 col-md-4 col-xl" key={label}><div className="summary-card"><i className={`bi ${icon} summary-icon ${tone}`} /><div className="summary-label">{label}</div><strong>{value}</strong></div></div>)}</div>

      <section className="data-panel"><div className="data-panel-heading"><div><span className="eyebrow">CALENDAR RECORDS / {purnimaData.calendar}</span><h2>Purnima Events</h2></div><span className="location-note">{purnimaData.yearRange} · {purnimaData.timezone}</span></div>{error ? <div className="state-panel"><i className="bi bi-exclamation-triangle" /><strong>Unable to load data.</strong><button className="subtle-action" type="button" onClick={() => setError(false)}>Retry</button></div> : loading ? <div className="state-panel"><span className="spinner-border spinner-border-sm" /> Loading analysis...</div> : visibleRecords.length === 0 ? <div className="state-panel"><i className="bi bi-calendar-x" /><strong>No records found.</strong><span>Try changing your filters.</span></div> : <><div className="table-responsive"><table className="analysis-table"><thead><tr><th>Event</th><th>Month</th><th>Date</th><th>Begins</th><th>Ends</th><th>End Time</th><th>Day</th><th>Test Date</th><th>Action</th></tr></thead><tbody>{visibleRecords.map((record) => <tr key={record.id}><td><strong>{record.name}</strong>{record.isVrat && <span className="festival-badge purnima-badge">Vrat</span>}</td><td>{record.month}</td><td>{record.dateLabel}</td><td>{record.beginsLabel}</td><td>{record.endsLabel}</td><td>{record.endTime}</td><td><span className={record.isWeekend ? 'weekend-text' : ''}>{record.day}</span></td><td>{record.isTestDay ? <span className="weekend-text">{record.testDate}</span> : '—'}</td><td><button className="view-button" type="button" onClick={() => setSelectedRecord(record)} aria-label={`View ${record.name}`}><i className="bi bi-eye" /></button></td></tr>)}</tbody></table></div><div className="pagination-row"><span>Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filteredRecords.length)} of {filteredRecords.length} records</span><div className="pagination-controls"><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} aria-label="Page size">{PAGE_SIZES.map((size) => <option key={size} value={size}>{size} / page</option>)}</select><button type="button" disabled={page === 1} onClick={() => changePage(page - 1)} aria-label="Previous page"><i className="bi bi-chevron-left" /></button><span>{page} / {totalPages}</span><button type="button" disabled={page === totalPages} onClick={() => changePage(page + 1)} aria-label="Next page"><i className="bi bi-chevron-right" /></button></div></div></>}</section>

      {selectedRecord && <div className="modal-backdrop-custom" role="presentation" onClick={() => setSelectedRecord(null)}><div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="purnima-detail-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">PURNIMA RECORD</span><h2 id="purnima-detail-title">{selectedRecord.name}</h2></div><button type="button" onClick={() => setSelectedRecord(null)} aria-label="Close details"><i className="bi bi-x-lg" /></button></div><div className="detail-grid"><div><small>PURNIMA DATE</small><strong>{selectedRecord.dateLabel}</strong></div><div><small>DAY / WEEKEND</small><strong>{selectedRecord.day} · {selectedRecord.isWeekend ? 'Weekend' : 'Weekday'}</strong></div><div><small>BEGINS</small><strong>{selectedRecord.beginsLabel}</strong></div><div><small>ENDS</small><strong>{selectedRecord.endsLabel}</strong></div><div><small>DURATION</small><strong>{selectedRecord.duration}</strong></div><div><small>TEST DATE</small><strong>{selectedRecord.testDate}</strong></div><div><small>LOCATION</small><strong>{LOCATION}</strong></div><div><small>TIMEZONE</small><strong>{purnimaData.timezone}</strong></div></div><p className="modal-note"><i className="bi bi-info-circle" /> Calendar: {purnimaData.calendar}. This JSON contains no OHLC data, so no actual support, resistance, or trading signal is calculated.</p></div></div>}
      {modal === 'rules' && <div className="modal-backdrop-custom" role="presentation" onClick={() => setModal(null)}><div className="detail-modal rules-modal" role="dialog" aria-modal="true" aria-labelledby="purnima-rules-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">MARKET OBSERVATION</span><h2 id="purnima-rules-title">Purnima Trading Rules</h2></div><button type="button" onClick={() => setModal(null)} aria-label="Close trading rules"><i className="bi bi-x-lg" /></button></div><ul className="rules-list marathi-rules"><li>पूर्णिमा दिवशी ट्रेड करू नका.</li><li>15-minute chart वापरा.</li><li>पूर्णिमा दिवसाचा High आणि Low मार्क करा.</li><li>Next Trading Day तपासा.</li><li>High/Low breakout होईपर्यंत Wait.</li><li>High breakout नंतर previous High monitor करा.</li><li>Low breakout नंतर previous Low monitor करा.</li><li>Support/Resistance update करा.</li></ul><p className="modal-note"><i className="bi bi-info-circle" /> Current JSON मध्ये market OHLC data नाही. हे rules reference-only आहेत; actual support/resistance किंवा signals calculate केलेले नाहीत.</p></div></div>}
    </div>
  );
}
