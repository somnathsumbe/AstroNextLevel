'use client';

import { useEffect, useMemo, useState } from 'react';
import bhadraData from '@/data/bhadra-dosh.json';
import { MONTHS, buildBhadraRecord } from '@/lib/bhadra-utils';

const PAGE_SIZE = 5;
const YEARS = [...new Set((bhadraData.records || []).map((record) => record.year))].sort((a, b) => a - b);
const currentYear = new Date().getFullYear();
const DEFAULT_YEAR = YEARS.includes(currentYear) ? currentYear : YEARS[YEARS.length - 1];

function downloadCsv(rows) {
  const headers = ['#', 'Start Date', 'Day', 'Start Time', 'End Date', 'End Time', 'Session Overlap'];
  const values = rows.map((row, index) => [index + 1, row.startDate, row.startDay, row.startTime, row.endDate, row.endTime, row.startInSession || row.endInSession ? 'Trading Session Overlap' : 'No overlap']);
  const csv = [headers, ...values].map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  link.download = 'bhadra-kaal-analysis.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function BhadraKaalPage() {
  const allRecords = useMemo(() => (bhadraData.records || []).map(buildBhadraRecord), []);
  const [selectedYear, setSelectedYear] = useState(DEFAULT_YEAR);
  const [appliedYear, setAppliedYear] = useState(DEFAULT_YEAR);
  const [month, setMonth] = useState('All months');
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 260);
    const closeOnEscape = (event) => { if (event.key === 'Escape') { setModal(null); setSelectedRecord(null); } };
    document.addEventListener('keydown', closeOnEscape);
    return () => { window.clearTimeout(timer); document.removeEventListener('keydown', closeOnEscape); };
  }, []);

  const filteredRecords = useMemo(() => allRecords.filter((record) => record.year === Number(appliedYear) && (month === 'All months' || record.month === month)), [allRecords, appliedYear, month]);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const visibleRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const weekendCount = filteredRecords.filter((record) => record.isWeekend).length;
  const overlapCount = filteredRecords.filter((record) => record.startInSession || record.endInSession).length;

  function showDetails(event) { event.preventDefault(); setAppliedYear(Number(selectedYear)); setPage(1); }
  function resetFilters() { setSelectedYear(DEFAULT_YEAR); setAppliedYear(DEFAULT_YEAR); setMonth('All months'); setPage(1); }

  return (
    <div className="bhadra-page">
      <div className="page-heading-row"><div><div className="eyebrow">BHADRA CYCLE / MARKET OBSERVATION</div><h1 className="page-title">Bhadra-kaal Pin Point Signals</h1><p className="page-subtitle">Bhadra Kaal Calendar &amp; Pin Point Signal Analysis</p><div className="breadcrumb-line"><i className="bi bi-house" /> Home <span>/</span> Bhadra Kaal</div><div className="location-note bhadra-location"><i className="bi bi-geo-alt" /> Mumbai, Maharashtra, India · Selected year {appliedYear}</div></div><div className="page-actions"><button className="outline-action" type="button" onClick={() => setModal('how-to')}><i className="bi bi-question-circle" /> Use</button><button className="outline-action" type="button" onClick={() => window.print()}><i className="bi bi-printer" /> Print</button><button className="outline-action" type="button" onClick={() => downloadCsv(filteredRecords)}><i className="bi bi-download" /> Export CSV</button></div></div>
      <form className="filter-panel" onSubmit={showDetails}><div className="filter-title"><span><i className="bi bi-sliders2" /> Calendar Filters</span><span className="filter-count">{filteredRecords.length} records</span></div><div className="row g-3 align-items-end"><div className="col-12 col-md-4"><label htmlFor="bhadra-year">Year</label><select id="bhadra-year" value={selectedYear} onChange={(event) => { setSelectedYear(Number(event.target.value)); setPage(1); }}>{YEARS.map((year) => <option key={year} value={year}>{year}</option>)}</select></div><div className="col-12 col-md-4"><label htmlFor="bhadra-month">Filter by month</label><select id="bhadra-month" value={month} onChange={(event) => { setMonth(event.target.value); setPage(1); }}>{MONTHS.map((item) => <option key={item}>{item}</option>)}</select></div><div className="col-12 col-md-4"><div className="filter-actions bhadra-filter-actions"><button className="gold-action" type="submit"><i className="bi bi-eye" /> Show Details</button><button className="subtle-action" type="button" onClick={resetFilters}><i className="bi bi-arrow-counterclockwise" /> Reset</button></div></div></div><div className="calculator-meta"><span><i className="bi bi-clock" /> NSE/BSE session reference: 09:15 AM–03:30 PM</span><span><i className="bi bi-globe2" /> Asia/Kolkata</span></div></form>
      <div className="row g-3 summary-row">{[['BHADRA RECORDS', filteredRecords.length, 'bi-fire', 'gold'], ['SELECTED YEAR', appliedYear, 'bi-calendar3', 'blue'], ['TRADING SESSION OVERLAP', overlapCount, 'bi-clock-history', 'green'], ['WEEKEND', weekendCount, 'bi-exclamation-triangle', 'orange']].map(([label, value, icon, tone]) => <div className="col-6 col-md-3" key={label}><div className="summary-card"><i className={`bi ${icon} summary-icon ${tone}`} /><div className="summary-label">{label}</div><strong>{value}</strong></div></div>)}</div>
      <section className="data-panel"><div className="data-panel-heading"><div><span className="eyebrow">CALENDAR RECORDS</span><h2>Bhadra Kaal Dates</h2></div><span className="location-note">{bhadraData.title} · {filteredRecords.length} filtered</span></div>{error ? <div className="state-panel"><i className="bi bi-exclamation-triangle" /><strong>Bhadra Kaal data could not be loaded.</strong><button className="subtle-action" type="button" onClick={() => setError(false)}>Retry</button></div> : loading ? <div className="state-panel"><span className="spinner-border spinner-border-sm" /> Loading Bhadra Kaal data...</div> : visibleRecords.length === 0 ? <div className="state-panel"><i className="bi bi-calendar-x" /><strong>No Bhadra Kaal data is available.</strong><span>Try changing the year or month.</span></div> : <><div className="table-responsive"><table className="analysis-table bhadra-table table table-bordered table-sm table-hover"><thead><tr><th>#</th><th>Start Date</th><th>Day</th><th>Start Time</th><th>End Date</th><th>End Time</th><th>Action</th></tr></thead><tbody>{visibleRecords.map((record, index) => <tr className={record.isWeekend ? 'weekend-row' : ''} key={record.id}><td>{(page - 1) * PAGE_SIZE + index + 1}</td><td><strong>{record.startDate}</strong></td><td><span className={record.isWeekend ? 'weekend-cell' : ''}>{record.startDay}{record.isWeekend && <small> WEEKEND</small>}</span></td><td><span className={record.startInSession ? 'trading-time-cell' : ''}>{record.startTime}{record.startInSession && <small> SESSION OVERLAP</small>}</span></td><td>{record.endDate}</td><td><span className={record.endInSession ? 'trading-time-cell' : ''}>{record.endTime}{record.endInSession && <small> SESSION OVERLAP</small>}</span></td><td><button className="view-button" type="button" onClick={() => setSelectedRecord(record)} aria-label={`View ${record.startDate}`}><i className="bi bi-eye" /></button></td></tr>)}</tbody></table></div><div className="pagination-row"><span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length} records</span><div className="pagination-controls"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><i className="bi bi-chevron-left" /></button><span>{page} / {totalPages}</span><button type="button" disabled={page === totalPages} onClick={() => setPage(page + 1)} aria-label="Next page"><i className="bi bi-chevron-right" /></button></div></div></>}</section>
      {selectedRecord && <div className="modal-backdrop-custom" role="presentation" onClick={() => setSelectedRecord(null)}><div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="bhadra-detail-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">BHADRA KAAL RECORD</span><h2 id="bhadra-detail-title">{selectedRecord.startDate}</h2></div><button type="button" onClick={() => setSelectedRecord(null)} aria-label="Close details"><i className="bi bi-x-lg" /></button></div><div className="detail-grid"><div><small>START</small><strong>{selectedRecord.startDate} · {selectedRecord.startTime}</strong></div><div><small>END</small><strong>{selectedRecord.endDate} · {selectedRecord.endTime}</strong></div><div><small>DAY</small><strong>{selectedRecord.startDay} · {selectedRecord.isWeekend ? 'Weekend' : 'Weekday'}</strong></div><div><small>SESSION</small><strong>{selectedRecord.startInSession || selectedRecord.endInSession ? 'Trading Session Overlap' : 'Outside Session'}</strong></div></div><p className="modal-note"><i className="bi bi-info-circle" /> Weekend labels are calendar context only. Session overlap does not represent a confirmed market signal.</p></div></div>}
      {modal === 'how-to' && <div className="modal-backdrop-custom" role="presentation" onClick={() => setModal(null)}><div className="detail-modal rules-modal" role="dialog" aria-modal="true" aria-labelledby="bhadra-how-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">BHADRA KAAL</span><h2 id="bhadra-how-title">How to use Pin Point Signals</h2></div><button type="button" onClick={() => setModal(null)} aria-label="Close how to use"><i className="bi bi-x-lg" /></button></div><ol className="rules-list degree-steps"><li>Select a year.</li><li>Click Show Details.</li><li>Use Filter by month to narrow records.</li><li>Review Start and End times.</li><li>Yellow highlight indicates overlap with the 09:15 AM–03:30 PM trading session.</li><li>Saturday/Sunday are marked as weekends.</li></ol></div></div>}
    </div>
  );
}
