'use client';

import { useEffect, useMemo, useState } from 'react';
import pushyaData from '@/data/pushya-nakshatra.json';
import { PUSHYA_MONTHS, buildPushyaRecord, dateKey, formatPushyaDate, parsePushyaDateTime } from '@/lib/pushya-utils';

const PAGE_SIZE = 10;
const INDIA_TIME_ZONE = 'Asia/Kolkata';

function todayIndianKey() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: INDIA_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function downloadCsv(rows) {
  const headers = ['Year', 'Nakshatra', 'Start Date', 'Start Time', 'End Date', 'End Time', 'Day', 'Market Status', 'Test Date'];
  const values = rows.map((row) => [row.year, row.nakshatra, row.startDateLabel, row.startTime, row.endDateLabel, row.endTime, row.day, row.marketStatus, row.testDate]);
  const csv = [headers, ...values].map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  link.download = 'pushya-nakshatra-analysis.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function PushyaNakshatraPage() {
  const records = useMemo(() => pushyaData.years.flatMap((yearData) => yearData.events.map((event, index) => buildPushyaRecord(yearData, event, index))), []);
  const years = useMemo(() => pushyaData.years.map((yearData) => yearData.year), []);
  const defaultYear = years.includes(new Date().getFullYear()) ? new Date().getFullYear() : years[0];
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState('All months');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 260);
    const closeOnEscape = (event) => { if (event.key === 'Escape') { setModal(null); setSelectedRecord(null); } };
    document.addEventListener('keydown', closeOnEscape);
    return () => { window.clearTimeout(timer); document.removeEventListener('keydown', closeOnEscape); };
  }, []);

  const filteredRecords = useMemo(() => records.filter((record) => {
    const query = appliedSearch.trim().toLowerCase();
    const matchesSearch = !query || [record.year, record.month, record.startDateLabel, record.endDateLabel, record.day].some((value) => String(value).toLowerCase().includes(query));
    return record.year === Number(year) && (month === 'All months' || record.month === month) && matchesSearch;
  }), [records, year, month, appliedSearch]);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const visibleRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const weekendCount = filteredRecords.filter((record) => record.isWeekend).length;
  const weekdayCount = filteredRecords.length - weekendCount;
  const nextEvent = records.filter((record) => dateKey(record.endDateTime) >= todayIndianKey()).sort((a, b) => a.endDateTime - b.endDateTime)[0];
  const daysRemaining = nextEvent ? Math.max(0, Math.ceil((nextEvent.startDateTime - parsePushyaDateTime(todayIndianKey(), '00:00')) / 86400000)) : null;

  useEffect(() => {
    const today = todayIndianKey();
    const tomorrowDate = new Date(`${today}T00:00:00Z`);
    tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);
    const tomorrow = dateKey(tomorrowDate);
    const match = records.find((record) => [dateKey(record.endDateTime)].includes(today) || [dateKey(record.endDateTime)].includes(tomorrow));
    if (!match) return undefined;
    const isToday = dateKey(match.endDateTime) === today;
    const storageKey = `astro_pushya_notice_${isToday ? today : tomorrow}`;
    if (window.sessionStorage.getItem(storageKey)) return undefined;
    window.sessionStorage.setItem(storageKey, 'shown');
    setToast({ title: isToday ? 'Pushya Nakshatra' : 'Pushya Reminder', text: `Pushya Nakshatra ${isToday ? 'ends today' : 'ends tomorrow'}: ${match.endDateLabel}` });
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [records]);

  function applySearch(event) { event.preventDefault(); setAppliedSearch(search); setPage(1); }
  function changeYear(value) { setYear(Number(value)); setPage(1); }
  function changeMonth(value) { setMonth(value); setPage(1); }
  function shiftMonth(direction) { const index = month === 'All months' ? -1 : PUSHYA_MONTHS.indexOf(month) - 1; const next = index + direction; setMonth(next < 0 || next > 11 ? 'All months' : PUSHYA_MONTHS[next + 1]); setPage(1); }

  return (
    <div className="pushya-page">
      <div className="page-heading-row"><div><div className="eyebrow">PUSHYA NAKSHATRA / MARKET OBSERVATION</div><h1 className="page-title">Pushya Nakshatra</h1><p className="page-subtitle">Pushya Nakshatra Calendar &amp; Market Observation</p><div className="breadcrumb-line"><i className="bi bi-house" /> Home <span>/</span> Pushya Nakshatra</div><div className="location-note pushya-location"><i className="bi bi-geo-alt" /> {pushyaData.location.city}, {pushyaData.location.state}, {pushyaData.location.country} · {pushyaData.location.timezone} ({pushyaData.location.timezoneOffset})</div></div><div className="page-actions"><button className="outline-action" type="button" onClick={() => setModal('use')}><i className="bi bi-question-circle" /> Use</button><button className="outline-action" type="button" onClick={() => window.print()}><i className="bi bi-printer" /> Print</button><button className="outline-action" type="button" onClick={() => downloadCsv(filteredRecords)}><i className="bi bi-download" /> Export CSV</button></div></div>
      <div className="pushya-source-strip"><span><i className="bi bi-patch-check" /> Primary source: {pushyaData.primarySource}</span><span><i className="bi bi-shield-check" /> {pushyaData.years.find((item) => item.year === Number(year))?.verificationStatus || 'verified'}</span><span><i className="bi bi-database" /> {pushyaData.totalEvents} supplied events · {pushyaData.period}</span></div>
      <form className="filter-panel" onSubmit={applySearch}><div className="filter-title"><span><i className="bi bi-sliders2" /> Calendar Filters</span><span className="filter-count">{filteredRecords.length} records</span></div><div className="row g-3 align-items-end"><div className="col-12 col-md-3"><label htmlFor="pushya-year">Year</label><select id="pushya-year" value={year} onChange={(event) => changeYear(event.target.value)}>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select></div><div className="col-12 col-md-3"><label htmlFor="pushya-month">Month</label><div className="month-navigation"><button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month"><i className="bi bi-chevron-left" /></button><select id="pushya-month" value={month} onChange={(event) => changeMonth(event.target.value)}>{PUSHYA_MONTHS.map((item) => <option key={item}>{item}</option>)}</select><button type="button" onClick={() => shiftMonth(1)} aria-label="Next month"><i className="bi bi-chevron-right" /></button></div></div><div className="col-12 col-md-4"><label htmlFor="pushya-search">Search</label><div className="filter-search"><i className="bi bi-search" /><input id="pushya-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Year, month, start, end or day" /></div></div><div className="col-12 col-md-2"><button className="gold-action w-100" type="submit"><i className="bi bi-search" /> Search</button></div></div></form>
      <div className="row g-3 summary-row">{[['SELECTED YEAR', year, 'bi-calendar3', 'gold'], ['PUSHYA EVENTS', filteredRecords.length, 'bi-star', 'blue'], ['WEEKEND END DATES', weekendCount, 'bi-calendar-week', 'orange'], ['WEEKDAY END DATES', weekdayCount, 'bi-calendar-check', 'green'], ['NEXT PUSHYA EVENT', nextEvent ? nextEvent.startDateLabel : '—', 'bi-arrow-right-circle', 'purple']].map(([label, value, icon, tone]) => <div className="col-6 col-md-4 col-xl" key={label}><div className="summary-card"><i className={`bi ${icon} summary-icon ${tone}`} /><div className="summary-label">{label}</div><strong>{value}</strong></div></div>)}</div>
      <section className="next-pushya-card"><div><span className="eyebrow">UPCOMING CALENDAR EVENT</span><h2><i className="bi bi-star-fill" /> Next Pushya Nakshatra</h2><p>{nextEvent ? `${nextEvent.startDateLabel} · ${nextEvent.startTimeLabel} to ${nextEvent.endDateLabel} · ${nextEvent.endTimeLabel}` : 'No upcoming Pushya Nakshatra event available.'}</p></div>{nextEvent && <div className="days-remaining"><strong>{daysRemaining}</strong><span>days remaining</span></div>}</section>
      <section className="data-panel"><div className="data-panel-heading"><div><span className="eyebrow">CALENDAR RECORDS / {pushyaData.location.timezone}</span><h2>Pushya Nakshatra Events</h2></div><span className="location-note">Year {year} · {pushyaData.primarySource}</span></div>{error ? <div className="state-panel"><i className="bi bi-exclamation-triangle" /><strong>Pushya Nakshatra data could not be loaded.</strong><button className="subtle-action" type="button" onClick={() => setError(false)}>Retry</button></div> : loading ? <div className="state-panel"><span className="spinner-border spinner-border-sm" /> Loading Pushya Nakshatra data...</div> : visibleRecords.length === 0 ? <div className="state-panel"><i className="bi bi-calendar-x" /><strong>No Pushya Nakshatra data is available for {year}.</strong><span>Try changing the month or search.</span></div> : <><div className="table-responsive"><table className="analysis-table pushya-table"><thead><tr><th>#</th><th>Start Date</th><th>Start Time</th><th>End Date</th><th>End Time</th><th>Day</th><th>Market Status</th><th>Test Date</th><th>Action</th></tr></thead><tbody>{visibleRecords.map((record, index) => <tr className={record.isWeekend ? 'weekend-row' : ''} key={record.id}><td>{(page - 1) * PAGE_SIZE + index + 1}</td><td><strong>{record.startDateLabel}</strong></td><td>{record.startTime}</td><td>{record.endDateLabel}</td><td>{record.endTime}</td><td>{record.day}</td><td><span className={`status-badge ${record.isWeekend ? 'weekend-status' : 'trading-status'}`}>{record.marketStatus}</span></td><td>{record.testDate !== '-' ? <span title="Next trading day">{record.testDate}</span> : '-'}</td><td><button className="view-button" type="button" onClick={() => setSelectedRecord(record)} aria-label={`View ${record.startDateLabel}`}><i className="bi bi-eye" /></button></td></tr>)}</tbody></table></div><div className="pagination-row"><span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length} records</span>{totalPages > 1 && <div className="pagination-controls"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><i className="bi bi-chevron-left" /></button><span>{page} / {totalPages}</span><button type="button" disabled={page === totalPages} onClick={() => setPage(page + 1)} aria-label="Next page"><i className="bi bi-chevron-right" /></button></div>}</div></>}</section>
      {selectedRecord && <div className="modal-backdrop-custom" role="presentation" onClick={() => setSelectedRecord(null)}><div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="pushya-detail-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">PUSHYA RECORD</span><h2 id="pushya-detail-title">Pushya Nakshatra</h2></div><button type="button" onClick={() => setSelectedRecord(null)} aria-label="Close details"><i className="bi bi-x-lg" /></button></div><div className="detail-grid"><div><small>YEAR</small><strong>{selectedRecord.year}</strong></div><div><small>DAY / STATUS</small><strong>{selectedRecord.day} · {selectedRecord.marketStatus}</strong></div><div><small>START</small><strong>{selectedRecord.startDateLabel} · {selectedRecord.startTime}</strong></div><div><small>END</small><strong>{selectedRecord.endDateLabel} · {selectedRecord.endTime}</strong></div><div><small>TEST DATE</small><strong>{selectedRecord.testDate}</strong></div><div><small>LOCATION</small><strong>{pushyaData.location.city}, {pushyaData.location.state}</strong></div><div><small>TIMEZONE</small><strong>{pushyaData.location.timezone} ({pushyaData.location.timezoneOffset})</strong></div><div><small>VERIFICATION</small><strong>{selectedRecord.verificationStatus}</strong></div><div><small>PRIMARY SOURCE</small><strong>{pushyaData.primarySource}</strong></div><div><small>SECONDARY SOURCE</small><strong>{selectedRecord.secondarySource}</strong></div></div><p className="modal-note"><i className="bi bi-info-circle" /> Calendar observation only. No NIFTY, support/resistance, reversal, or market outcome is calculated from this JSON.</p></div></div>}
      {modal === 'use' && <div className="modal-backdrop-custom" role="presentation" onClick={() => setModal(null)}><div className="detail-modal rules-modal" role="dialog" aria-modal="true" aria-labelledby="pushya-use-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">ANALYTICAL OBSERVATION</span><h2 id="pushya-use-title">⭐ PUSHYA NAKSHATRA</h2><p className="modal-subtitle">Potential NIFTY Reversal / Momentum Observation Zone</p></div><button type="button" onClick={() => setModal(null)} aria-label="Close usage"><i className="bi bi-x-lg" /></button></div><h3 className="modal-section-title">काय पाहायचे?</h3><ul className="rules-list"><li>Pushya Start / End Time</li><li>त्या वेळचा NIFTY 15-Min Candle</li><li>Market Trend आणि जवळचा Swing High / Swing Low</li><li>Support / Resistance आणि Reversal Confirmation</li></ul><h3 className="modal-section-title">Market Downtrend मध्ये</h3><p className="modal-copy">Low formation शोधा आणि bullish reversal मिळाल्यास LONG setup तपासा.</p><h3 className="modal-section-title">Market Uptrend मध्ये</h3><p className="modal-copy">High formation शोधा आणि bearish reversal मिळाल्यास SHORT setup तपासा.</p><div className="observation-note"><strong>Historical / User Observation — Requires Backtest Validation</strong><span>Point movement statistics are intentionally not shown because no verified backtest data is connected.</span></div><div className="warning-note"><strong>Pushya = Alert</strong><span>Technical Confirmation = Entry Signal</span><b>Blind Buy/Sell करू नका.</b></div></div></div>}
      {toast && <div className="toast-message pushya-toast" role="status"><i className="bi bi-star-fill" /><div><strong>{toast.title}</strong><span>{toast.text}</span></div><button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification"><i className="bi bi-x" /></button></div>}
    </div>
  );
}
