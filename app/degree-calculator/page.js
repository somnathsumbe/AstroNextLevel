'use client';

import { useMemo, useState } from 'react';
import marchEquinox from '@/data/march-equinox.json';
import { addUtcDays, buildDegreeResults, dateInputValue, formatDate, monthName, parseUtcDate } from '@/lib/degree-utils';

const PAGE_SIZE = 10;
const GANN_PAGE_SIZE = 5;
const MONTHS = ['All months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function suppliedDate(entry) {
  const [day, month] = entry.date.split(' ');
  const monthNumber = new Date(`${month} 1, ${entry.year} UTC`).getUTCMonth() + 1;
  return `${entry.year}-${String(monthNumber).padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function parseMonth(value) {
  return new Date(`${value} 1, 2026 UTC`).getUTCMonth();
}

function todayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function downloadCsv(rows) {
  const headers = ['#', 'Target Degree', 'Days', 'Calendar Date', 'Day', 'Market Status', 'Test Date', 'Actual Degree'];
  const values = rows.map((row, index) => [index + 1, row.targetDegree, row.days, formatDate(row.calendarDate), row.day, row.marketStatus, row.testDate, row.actualDegree]);
  const csv = [headers, ...values].map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  link.download = 'degree-calculator.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function DegreeCalculatorPage() {
  const validZeroDates = useMemo(() => marchEquinox.entries.map(suppliedDate), []);
  const defaultZeroDate = validZeroDates.includes('2026-03-20') ? '2026-03-20' : validZeroDates[validZeroDates.length - 1] || '2026-03-20';
  const [zeroDate, setZeroDate] = useState(defaultZeroDate);
  const [calculatedZeroDate, setCalculatedZeroDate] = useState(defaultZeroDate);
  const [results, setResults] = useState(() => buildDegreeResults(parseUtcDate(defaultZeroDate)));
  const [month, setMonth] = useState('All months');
  const [page, setPage] = useState(1);
  const [gannVisible, setGannVisible] = useState(false);
  const [gannPage, setGannPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const filteredResults = useMemo(() => results.filter((result) => month === 'All months' || result.month === month), [results, month]);
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));
  const visibleResults = filteredResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const gannRows = marchEquinox.entries;
  const gannTotalPages = Math.max(1, Math.ceil(gannRows.length / GANN_PAGE_SIZE));
  const visibleGannRows = gannRows.slice((gannPage - 1) * GANN_PAGE_SIZE, gannPage * GANN_PAGE_SIZE);
  const nextReversal = results.find((result) => result.calendarDate >= todayUtc()) || results[0];
  const tradingDays = results.filter((result) => result.marketStatus === 'TRADING DAY').length;
  const weekendDays = results.length - tradingDays;

  function showReversalToast(nextResults) {
    const todayValue = dateInputValue(todayUtc());
    const tomorrowValue = dateInputValue(addUtcDays(parseUtcDate(todayValue), 1));
    const match = nextResults.find((result) => [todayValue, tomorrowValue].includes(dateInputValue(result.calendarDate)));
    if (!match) return;
    const storageKey = `astro_degree_notice_${dateInputValue(match.calendarDate)}`;
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, 'shown');
    setToast({ title: 'Reversal Day', text: `${formatDate(match.calendarDate)} is ${todayValue === dateInputValue(match.calendarDate) ? 'today' : 'tomorrow'}.` });
    window.setTimeout(() => setToast(null), 5500);
  }

  function calculate(event) {
    event.preventDefault();
    setError('');
    if (!validZeroDates.includes(zeroDate)) {
      setError('Select a valid supplied March Equinox / Gann-Zilla date.');
      return;
    }
    const nextResults = buildDegreeResults(parseUtcDate(zeroDate));
    setCalculatedZeroDate(zeroDate);
    setResults(nextResults);
    setMonth('All months');
    setPage(1);
    showReversalToast(nextResults);
  }

  function shiftMonth(direction) {
    const current = month === 'All months' ? -1 : parseMonth(month);
    const next = current + direction;
    setMonth(next < 0 || next > 11 ? 'All months' : MONTHS[next + 1]);
    setPage(1);
  }

  function resetCalculator() {
    setZeroDate(defaultZeroDate);
    setCalculatedZeroDate(defaultZeroDate);
    setResults(buildDegreeResults(parseUtcDate(defaultZeroDate)));
    setMonth('All months');
    setPage(1);
    setError('');
  }

  return (
    <div className="degree-page">
      <div className="page-heading-row"><div><div className="eyebrow">ASTRO CYCLES / REVERSAL ANALYSIS</div><h1 className="page-title">Degree Calculator</h1><p className="page-subtitle">Gann-Zilla Degree Calculation &amp; Reversal Day Analysis</p><div className="breadcrumb-line"><i className="bi bi-house" /> Home <span>/</span> Degree Calculator</div></div><div className="page-actions"><button className="outline-action" type="button" onClick={() => setModal('how-to')}><i className="bi bi-question-circle" /> How to use</button><button className="outline-action" type="button" onClick={() => downloadCsv(filteredResults)}><i className="bi bi-download" /> Export CSV</button><button className={`outline-action ${gannVisible ? 'active-action' : ''}`} type="button" onClick={() => { setGannVisible(!gannVisible); setGannPage(1); }}><i className="bi bi-calendar3" /> Gann-Zilla Dates</button></div></div>

      <form className="filter-panel degree-calculator" onSubmit={calculate}><div className="filter-title"><span><i className="bi bi-calculator" /> Calculator Parameters</span><span className="location-note">{marchEquinox.location}</span></div><div className="row g-3 align-items-end"><div className="col-12 col-md-4"><label htmlFor="zero-date">Zero Date</label><input id="zero-date" type="date" value={zeroDate} onChange={(event) => setZeroDate(event.target.value)} /></div><div className="col-6 col-md-3"><label htmlFor="degree-year">Degree per Year</label><input id="degree-year" value="360" disabled readOnly /></div><div className="col-6 col-md-3"><label htmlFor="days-year">Days per Year</label><input id="days-year" value="365.25" disabled readOnly /></div><div className="col-12 col-md-2"><button className="gold-action w-100" type="submit"><i className="bi bi-lightning-charge" /> Calculate</button></div></div>{error && <div className="calculator-error"><i className="bi bi-exclamation-circle" /> {error}</div>}<div className="calculator-meta"><span><i className="bi bi-shield-check" /> Valid zero dates only</span><span><i className="bi bi-database" /> {marchEquinox.entries.length} supplied Gann-Zilla dates</span><button type="button" className="subtle-action" onClick={resetCalculator}>Reset</button></div></form>

      <div className="row g-3 summary-row">{[['ZERO DATE', formatDate(parseUtcDate(calculatedZeroDate)), 'bi-calendar-event', 'gold'], ['TOTAL DEGREE LEVELS', results.length, 'bi-grid-3x3-gap', 'blue'], ['TRADING DAYS', tradingDays, 'bi-graph-up-arrow', 'green'], ['WEEKEND DAYS', weekendDays, 'bi-calendar-week', 'purple'], ['NEXT REVERSAL DATE', nextReversal ? formatDate(nextReversal.calendarDate) : '—', 'bi-arrow-right-circle', 'orange']].map(([label, value, icon, tone]) => <div className="col-6 col-md-4 col-xl" key={label}><div className="summary-card"><i className={`bi ${icon} summary-icon ${tone}`} /><div className="summary-label">{label}</div><strong>{value}</strong></div></div>)}</div>

      <section className="data-panel"><div className="data-panel-heading"><div><span className="eyebrow">CALCULATED LEVELS</span><h2>Reversal Day Dates</h2></div><div className="month-navigation"><button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month"><i className="bi bi-chevron-left" /></button><select value={month} onChange={(event) => { setMonth(event.target.value); setPage(1); }} aria-label="Filter by month">{MONTHS.map((item) => <option key={item}>{item}</option>)}</select><button type="button" onClick={() => shiftMonth(1)} aria-label="Next month"><i className="bi bi-chevron-right" /></button></div></div><div className="table-responsive"><table className="analysis-table degree-table"><thead><tr><th>#</th><th>Target Degree</th><th>Days</th><th>Calendar Date</th><th>Day</th><th>Market Status</th><th>Test Date</th><th>Actual Degree</th></tr></thead><tbody>{visibleResults.map((result, index) => <tr className={result.isWeekend ? 'weekend-row' : ''} key={result.id}><td>{(page - 1) * PAGE_SIZE + index + 1}</td><td><strong>{result.targetDegree}°</strong></td><td>{result.days}</td><td>{formatDate(result.calendarDate)}</td><td>{result.day}</td><td><span className={`status-badge ${result.isWeekend ? 'weekend-status' : 'trading-status'}`}>{result.marketStatus}</span></td><td>{result.isWeekend ? result.testDate : '—'}</td><td>{result.actualDegree.toFixed(4)}°</td></tr>)}</tbody></table></div><div className="pagination-row"><span>Showing {filteredResults.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filteredResults.length)} of {filteredResults.length} records</span><div className="pagination-controls"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><i className="bi bi-chevron-left" /></button><span>{page} / {totalPages}</span><button type="button" disabled={page === totalPages} onClick={() => setPage(page + 1)} aria-label="Next page"><i className="bi bi-chevron-right" /></button></div></div></section>

      {gannVisible && <section className="data-panel gann-panel"><div className="data-panel-heading"><div><span className="eyebrow">SUPPLIED JSON DATES</span><h2>Gann-Zilla Dates</h2></div><span className="location-note">March Equinox · {marchEquinox.location}</span></div><div className="table-responsive"><table className="analysis-table"><thead><tr><th>Year</th><th>Date</th><th>Software</th><th>Indian Time</th></tr></thead><tbody>{visibleGannRows.map((entry) => <tr key={`${entry.year}-${entry.date}`}><td><strong>{entry.year}</strong></td><td>{entry.date}</td><td>{entry.softwareTime}</td><td>{entry.indianTime}</td></tr>)}</tbody></table></div><div className="pagination-row"><span>Showing {(gannPage - 1) * GANN_PAGE_SIZE + 1}–{Math.min(gannPage * GANN_PAGE_SIZE, gannRows.length)} of {gannRows.length} dates</span><div className="pagination-controls"><button type="button" disabled={gannPage === 1} onClick={() => setGannPage(gannPage - 1)} aria-label="Previous Gann-Zilla page"><i className="bi bi-chevron-left" /></button><span>{gannPage} / {gannTotalPages}</span><button type="button" disabled={gannPage === gannTotalPages} onClick={() => setGannPage(gannPage + 1)} aria-label="Next Gann-Zilla page"><i className="bi bi-chevron-right" /></button></div></div></section>}

      {modal === 'how-to' && <div className="modal-backdrop-custom" role="presentation" onClick={() => setModal(null)}><div className="detail-modal rules-modal" role="dialog" aria-modal="true" aria-labelledby="degree-how-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">DEGREE CALCULATOR</span><h2 id="degree-how-title">How to use Degree</h2></div><button type="button" onClick={() => setModal(null)} aria-label="Close how to use"><i className="bi bi-x-lg" /></button></div><ol className="rules-list degree-steps"><li>Select a Gann-Zilla / March Equinox zero date.</li><li>Only valid supplied dates should be accepted.</li><li>Degree per Year is 360.</li><li>Days per Year is 365.25.</li><li>Click Calculate.</li><li>Use month filtering to inspect calculated reversal dates.</li><li>Check weekend/Test Date before market analysis.</li></ol></div></div>}
      {toast && <div className="toast-message degree-toast" role="status"><i className="bi bi-calendar2-event" /><div><strong>{toast.title}</strong><span>{toast.text}</span></div><button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification"><i className="bi bi-x" /></button></div>}
    </div>
  );
}
