'use client';

import { useEffect, useMemo, useState } from 'react';
import rawData from '@/src/data/sun-jupiter-tracking.json';
import { exportSunJupiterCsv } from '@/src/lib/export-utils';
import { dateKey, formatLongDate, getNextMonday, getWeekFriday, getWeekMonday, monthName, isWeekend } from '@/src/lib/date-utils';
import type { SunJupiterData, SunJupiterEvent, SunJupiterRecord } from '@/src/types/sun-jupiter';

const PAGE_SIZE = 10;
const MONTHS = ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DATA = rawData as SunJupiterData;

function buildRecord(event: SunJupiterEvent, index: number): SunJupiterRecord {
  const testDate = getNextMonday(event.date);
  const weekStart = getWeekMonday(testDate);
  const weekEnd = getWeekFriday(testDate);
  return {
    ...event,
    aspect: DATA.aspects[String(event.angle)] || event.aspect,
    id: `sun-jupiter-${event.date}-${index}`,
    year: Number(event.date.slice(0, 4)),
    dateLabel: formatLongDate(event.date),
    testDate,
    testDateLabel: formatLongDate(testDate),
    weekStart,
    weekEnd,
    weekLabel: `${formatLongDate(weekStart)} to ${formatLongDate(weekEnd)}`,
    month: monthName(event.date),
    weekend: isWeekend(event.day),
  };
}

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export default function SunJupiterTrackingPage() {
  const records = useMemo(() => DATA.events.map(buildRecord), []);
  const years = useMemo(() => [...new Set(records.map((record) => record.year))].sort((a, b) => a - b), [records]);
  const currentYear = new Date().getFullYear();
  const initialYear = years.includes(currentYear) ? currentYear : years[years.length - 1];
  const [yearSelection, setYearSelection] = useState(initialYear);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [search, setSearch] = useState('');
  const [angle, setAngle] = useState('All Angles');
  const [month, setMonth] = useState('All Months');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [details, setDetails] = useState<SunJupiterRecord | null>(null);
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
      const searchable = [record.date, record.dateLabel, record.day, record.timeIST, record.angle, record.aspect].join(' ').toLowerCase();
      return (!query || searchable.includes(query))
        && (angle === 'All Angles' || record.angle === Number(angle))
        && (month === 'All Months' || record.month === month);
    });
  }, [yearRecords, search, angle, month]);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const visibleRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const nextEvent = filteredRecords.filter((record) => dateKey(record.date) >= dateKey(todayIso())).sort((a, b) => dateKey(a.date) - dateKey(b.date))[0];
  const summaryAngles = [0, 45, 90, 180];
  const summaryValues = summaryAngles.map((target) => yearRecords.filter((record) => record.angle === target).length);

  function resetPage() { setPage(1); }
  function submitYear(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelectedYear(yearSelection);
    resetPage();
    setLoading(true);
    window.setTimeout(() => setLoading(false), 250);
  }
  function shiftMonth(direction: number) {
    const current = MONTHS.indexOf(month);
    const next = current === 0 ? (direction > 0 ? 1 : 12) : ((current - 1 + direction + 12) % 12) + 1;
    setMonth(MONTHS[next]);
    resetPage();
  }
  function clearFilters() {
    setSearch('');
    setAngle('All Angles');
    setMonth('All Months');
    resetPage();
  }

  return (
    <main className="container-fluid tool-page weekly-market-page sun-jupiter-page">
      <header className="page-heading-row">
        <div>
          <div className="eyebrow">ASTRO TOOL</div>
          <h1 className="page-title">Weekly Market Tracking</h1>
          <p className="page-subtitle">Sun-Jupiter Degree Crossing &amp; Weekly Trend Analysis</p>
          <div className="calculator-meta"><span><i className="bi bi-globe2" /> {DATA.coordinateSystem}</span><span><i className="bi bi-clock" /> {DATA.timezone}</span><span><i className="bi bi-calendar3" /> {selectedYear}</span></div>
          <nav className="breadcrumb-line" aria-label="Breadcrumb"><i className="bi bi-house" /> <a href="/dashboard">Dashboard</a> <span>/</span> Sun-Jupiter Tracking</nav>
        </div>
        <div className="page-actions">
          <button className="outline-action" type="button" onClick={() => setShowUsage(true)}><i className="bi bi-lightbulb" /> Use</button>
          <button className="outline-action" type="button" onClick={() => window.print()}><i className="bi bi-printer" /> Print</button>
          <button className="outline-action" type="button" onClick={() => exportSunJupiterCsv(filteredRecords)}><i className="bi bi-download" /> Export CSV</button>
        </div>
      </header>

      <form className="filter-panel" onSubmit={submitYear}>
        <div className="filter-title"><span><i className="bi bi-sliders2" /> Weekly Tracking Filters</span><span className="filter-count">{filteredRecords.length} records</span></div>
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-3"><label htmlFor="sun-jupiter-year">Year</label><select id="sun-jupiter-year" value={yearSelection} onChange={(event) => { setYearSelection(Number(event.target.value)); resetPage(); }}>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></div>
          <div className="col-12 col-md-3"><label htmlFor="sun-jupiter-angle">Angle</label><select id="sun-jupiter-angle" value={angle} onChange={(event) => { setAngle(event.target.value); resetPage(); }}><option>All Angles</option>{DATA.targetAngles.map((target) => <option key={target} value={target}>{target}° - {DATA.aspects[String(target)]}</option>)}</select></div>
          <div className="col-12 col-md-3"><label htmlFor="sun-jupiter-month">Month</label><div className="month-navigation"><button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month"><i className="bi bi-chevron-left" /></button><select id="sun-jupiter-month" value={month} onChange={(event) => { setMonth(event.target.value); resetPage(); }}>{MONTHS.map((item) => <option key={item}>{item}</option>)}</select><button type="button" onClick={() => shiftMonth(1)} aria-label="Next month"><i className="bi bi-chevron-right" /></button></div></div>
          <div className="col-12 col-md-3"><div className="filter-actions weekly-filter-actions"><button className="gold-action" type="submit" disabled={loading}><i className="bi bi-search" /> {loading ? 'Loading...' : 'Show Details'}</button><button className="subtle-action" type="button" onClick={clearFilters}>Clear</button></div></div>
          <div className="col-12"><label htmlFor="sun-jupiter-search">Search date, angle, aspect, day...</label><div className="filter-search"><i className="bi bi-search" /><input id="sun-jupiter-search" value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} placeholder="Search date, angle, aspect, day..." /></div></div>
        </div>
      </form>

      <section className="row g-3 summary-row" aria-label="Sun-Jupiter summary">
        {[['SELECTED YEAR', selectedYear, 'bi-calendar3', 'gold'], ['TOTAL EVENTS', yearRecords.length, 'bi-bar-chart-line', 'blue'], ['CONJUNCTION', summaryValues[0], 'bi-circle', 'green'], ['SEMI-SQUARE', summaryValues[1], 'bi-bullseye', 'purple'], ['SQUARE', summaryValues[2], 'bi-diamond', 'orange'], ['OPPOSITION', summaryValues[3], 'bi-circle-fill', 'gold']].map(([label, value, icon, tone]) => <div className="col-6 col-md-4 col-xl-2" key={String(label)}><article className="summary-card"><i className={`bi ${icon} summary-icon ${tone}`} /><div className="summary-label">{label}</div><strong>{value}</strong></article></div>)}
      </section>

      <section className="next-degree-card" aria-labelledby="next-event-title"><div><span className="eyebrow">UPCOMING ASTRO EVENT</span><h2 id="next-event-title"><i className="bi bi-sun" /> Next Sun-Jupiter Degree Event</h2>{nextEvent ? <div className="detail-grid compact"><div><small>DATE</small><strong>{nextEvent.dateLabel}</strong></div><div><small>DAY</small><strong>{nextEvent.day}</strong></div><div><small>ANGLE</small><strong>{nextEvent.angle}°</strong></div><div><small>ASPECT</small><strong>{nextEvent.aspect}</strong></div><div><small>TIME IST</small><strong>{nextEvent.timeIST}</strong></div></div> : <p>No upcoming Sun-Jupiter event available for this year.</p>}</div></section>

      <section className="data-panel" aria-labelledby="events-title"><div className="data-panel-heading"><div><span className="eyebrow">SUN-JUPITER / REFERENCE CALENDAR</span><h2 id="events-title">Events for {selectedYear}</h2></div><span className="location-note">{DATA.planetPair} · {DATA.period}</span></div>
        {error ? <div className="state-panel" role="alert"><i className="bi bi-exclamation-triangle" /><strong>Sun-Jupiter tracking data could not be loaded.</strong><button className="subtle-action" type="button" onClick={() => setError(false)}>Retry</button></div> : loading ? <div className="state-panel" role="status"><span className="spinner-border spinner-border-sm" /> Loading Sun-Jupiter tracking data...</div> : visibleRecords.length === 0 ? <div className="state-panel"><i className="bi bi-calendar-x" /><strong>No Sun-Jupiter events are available.</strong><span>Select another year or clear the filters.</span><button className="subtle-action" type="button" onClick={clearFilters}>Clear Filters</button></div> : <>
          <div className="table-responsive"><table className="analysis-table weekly-table sun-jupiter-events-table"><caption className="visually-hidden">Sun-Jupiter events for {selectedYear}</caption><thead><tr><th>#</th><th>Date</th><th>Test Date</th><th>Week Testing</th><th>Day</th><th>Time (IST)</th><th>Angle</th><th>Aspect</th><th>Action</th></tr></thead><tbody>{visibleRecords.map((record, index) => <tr className={record.weekend ? 'weekend-row' : ''} key={record.id}><td data-label="#">{(page - 1) * PAGE_SIZE + index + 1}</td><td data-label="Date"><strong>{record.dateLabel}</strong></td><td data-label="Test Date">{record.testDateLabel}</td><td data-label="Week Testing"><span className="status-badge trading-status">{record.weekLabel}</span></td><td data-label="Day">{record.day} {record.weekend && <span className="status-badge weekend-status">Weekend</span>}</td><td data-label="Time (IST)">{record.timeIST}</td><td data-label="Angle"><span className="degree-badge">{record.angle}°</span></td><td data-label="Aspect">{record.aspect}</td><td data-label="Action"><button className="view-button" type="button" onClick={() => setDetails(record)} aria-label={`View details for ${record.dateLabel}`}><i className="bi bi-eye" /> View</button></td></tr>)}</tbody></table></div>
          <div className="pagination-row"><span>Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length}</span><div className="pagination-controls"><button className="subtle-action" type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => <button className={`subtle-action ${page === item ? 'current-page' : ''}`} type="button" key={item} onClick={() => setPage(item)} aria-current={page === item ? 'page' : undefined}>{item}</button>)}<button className="subtle-action" type="button" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button></div></div>
        </>}
      </section>

      <section className="data-panel weekly-observation" aria-labelledby="weekly-observation-title"><div className="data-panel-heading"><div><span className="eyebrow">WEEKLY MARKET OBSERVATION</span><h2 id="weekly-observation-title">Weekly Market Observation</h2></div><i className="bi bi-graph-up-arrow" /></div>{visibleRecords.length > 0 ? <div className="table-responsive"><table className="analysis-table sun-jupiter-observation-table"><thead><tr><th>Event Date</th><th>Test Date</th><th>Testing Week</th><th>Target Angle</th><th>Aspect</th><th>Weekly High</th><th>Weekly Low</th><th>Breakout Status</th><th>Trend Confirmation</th></tr></thead><tbody>{visibleRecords.map((record) => <tr key={`observation-${record.id}`}><td data-label="Event Date">{record.dateLabel}</td><td data-label="Test Date">{record.testDateLabel}</td><td data-label="Testing Week">{record.weekLabel}</td><td data-label="Target Angle">{record.angle}°</td><td data-label="Aspect">{record.aspect}</td><td data-label="Weekly High">—</td><td data-label="Weekly Low">—</td><td data-label="Breakout Status">Awaiting Market Data</td><td data-label="Trend Confirmation">Awaiting Market Data</td></tr>)}</tbody></table></div> : <p className="modal-copy">Select an event to review its Monday-Friday observation week. Real market data is not included in this dataset.</p>}<p className="modal-note"><i className="bi bi-info-circle" /> This is an Astro Event + Market Observation Reference Tool. Weekly High/Low, breakout, and trend confirmation require actual market-session data.</p></section>

      {details && <div className="modal-backdrop-custom" role="presentation" onClick={() => setDetails(null)}><div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="sun-jupiter-details-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">SUN-JUPITER EVENT</span><h2 id="sun-jupiter-details-title">Sun-Jupiter Event Details</h2></div><button type="button" onClick={() => setDetails(null)} aria-label="Close details"><i className="bi bi-x-lg" /></button></div><div className="detail-grid"><div><small>DATE</small><strong>{details.dateLabel}</strong></div><div><small>DAY</small><strong>{details.day} · {details.weekend ? 'Weekend' : 'Weekday'}</strong></div><div><small>TIME IST</small><strong>{details.timeIST}</strong></div><div><small>ANGLE</small><strong>{details.angle}°</strong></div><div><small>ASPECT</small><strong>{details.aspect}</strong></div><div><small>TEST DATE</small><strong>{details.testDateLabel}</strong></div><div><small>WEEK TESTING</small><strong>{details.weekLabel}</strong></div><div><small>COORDINATE SYSTEM</small><strong>{DATA.coordinateSystem}</strong></div><div><small>ANGLE CALCULATION</small><strong>{DATA.angleCalculation}</strong></div><div><small>TIMEZONE</small><strong>{DATA.timezone}</strong></div></div></div></div>}
      {showUsage && <div className="modal-backdrop-custom" role="presentation" onClick={() => setShowUsage(false)}><div className="detail-modal rules-modal" role="dialog" aria-modal="true" aria-labelledby="strategy-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">ASTRO TOOL</span><h2 id="strategy-title">Sun-Jupiter Weekly Market Tracking Strategy</h2></div><button type="button" onClick={() => setShowUsage(false)} aria-label="Close strategy"><i className="bi bi-x-lg" /></button></div><ol className="rules-list degree-steps"><li><strong>Sun आणि Jupiter ची Degree तपासा</strong><br />दोन्ही ग्रहांमधील अंतर शोधा. 0°, 45°, 90°, 135° आणि 180° हे observation levels म्हणून track करा.</li><li><strong>Degree Holiday ला आली तर</strong><br />Level date Saturday/Sunday किंवा actual market holiday असल्यास पुढचा market trading day test date म्हणून वापरा.</li><li><strong>त्या Date चा पूर्ण Week महत्त्वाचा</strong><br />Event च्या test date चा Monday-Friday week identify करा. त्या week चा High आणि Low record करा.</li><li><strong>Weekly High-Low जपून ठेवा</strong><br />त्या trading week चे High आणि Low levels historical analysis साठी store करा.</li><li><strong>High किंवा Low Break झाल्यावर लक्ष द्या</strong><br />Weekly High/Low break ला market-data based observation म्हणून evaluate करा.</li><li><strong>फक्त Touch नाही, Break तपासा</strong><br />Actual price data वापरून breakout आहे का ते तपासा.</li><li><strong>Level आणि Trend एकत्र पहा</strong><br />Trend + price breakout यांचे independent technical confirmation करा.</li><li><strong>Advance मध्ये Levels तयार ठेवा</strong><br />पुढील 0°, 45°, 90°, 135°, 180° dates आधीच identify करा आणि संबंधित week mark करा.</li></ol><div className="warning-note"><strong>Sun-Jupiter degree crossing alone is NOT a confirmed Buy/Sell signal. Always verify with actual market data and technical confirmation.</strong></div></div></div>}
    </main>
  );
}
