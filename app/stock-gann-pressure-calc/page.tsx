'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const IST_ZONE = 'Asia/Kolkata';
const DAY_MS = 86_400_000;
const PAGE_SIZE = 10;
const ANGLES = [30, 45, 60, 90, 120, 135, 144, 180, 216, 225, 240, 270, 315, 360] as const;
const IMPORTANT_ANGLES = new Set([45, 90, 135, 180, 225, 270, 315, 360]);
const MONTHS = ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const FINANCIAL_ZERO_DATES: readonly FinancialZeroDate[] = [
  { date: '2020-03-20', time: '09:19' },
  { date: '2021-03-20', time: '15:07' },
  { date: '2022-03-20', time: '21:03' },
  { date: '2023-03-21', time: '02:54' },
  { date: '2024-03-20', time: '08:36' },
  { date: '2025-03-20', time: '14:31' },
  { date: '2026-03-20', time: '20:16' },
  { date: '2027-03-21', time: '01:54' },
  { date: '2028-03-20', time: '07:47' },
  { date: '2029-03-20', time: '13:32' },
  { date: '2030-03-20', time: '19:21' },
];

interface FinancialZeroDate { date: string; time: string }
type CalculationBase = 'financial' | 'stock';
type ReferenceType = 'Major High' | 'Major Low';
type Timeframe = '4 Hour' | 'Daily' | 'Weekly';

interface GannPressureResult {
  angle: number;
  days: number;
  pressureDate: Date;
  pressureTime: string;
  windowStart: Date;
  windowEnd: Date;
  important: boolean;
}

function localDateInput(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function parseDateTime(dateValue: string, timeValue: string): Date | null {
  const dateParts = dateValue.split('-').map(Number);
  const timeParts = timeValue.split(':').map(Number);
  if (dateParts.length !== 3 || timeParts.length < 2 || dateParts.some((part) => !Number.isFinite(part)) || timeParts.some((part) => !Number.isFinite(part))) return null;
  const [year, month, day] = dateParts;
  const [hour, minute] = timeParts;
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - (5.5 * 60 * 60 * 1000));
}

function addDaysExact(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function dateParts(date: Date): Record<string, string> {
  return Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: IST_ZONE, day: '2-digit', month: 'short', year: 'numeric' }).formatToParts(date).map(({ type, value }) => [type, value]));
}

function formatDate(date: Date): string {
  const parts = dateParts(date);
  return `${parts.day}-${parts.month}-${parts.year}`;
}

function formatDay(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', { timeZone: IST_ZONE, weekday: 'long' }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', { timeZone: IST_ZONE, hour: '2-digit', minute: '2-digit', hour12: true }).format(date);
}

function monthFor(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', { timeZone: IST_ZONE, month: 'long' }).format(date);
}

function isWeekend(date: Date): boolean {
  const day = formatDay(date);
  return day === 'Saturday' || day === 'Sunday';
}

export default function StockGannPressureCalcPage() {
  const currentYear = new Date().getFullYear();
  const defaultFinancial = FINANCIAL_ZERO_DATES.find((entry) => entry.date.startsWith(String(currentYear))) || FINANCIAL_ZERO_DATES[FINANCIAL_ZERO_DATES.length - 1];
  const [financialDate, setFinancialDate] = useState(defaultFinancial.date);
  const [financialTime, setFinancialTime] = useState(defaultFinancial.time);
  const [referenceDate, setReferenceDate] = useState(localDateInput);
  const [referenceTime, setReferenceTime] = useState('09:15');
  const [referenceType, setReferenceType] = useState<ReferenceType>('Major High');
  const [timeframe, setTimeframe] = useState<Timeframe>('4 Hour');
  const [windowDays, setWindowDays] = useState(2);
  const [calculationBase, setCalculationBase] = useState<CalculationBase>('financial');
  const [selectedAngles, setSelectedAngles] = useState<Set<number>>(() => new Set(ANGLES));
  const [results, setResults] = useState<GannPressureResult[]>([]);
  const [month, setMonth] = useState('All Months');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [showUsage, setShowUsage] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setShowUsage(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  useEffect(() => {
    const matchingDate = FINANCIAL_ZERO_DATES.find((entry) => entry.date === financialDate);
    if (matchingDate) setFinancialTime(matchingDate.time);
  }, [financialDate]);

  useEffect(() => {
    const base = calculationBase === 'financial' ? parseDateTime(financialDate, financialTime) : parseDateTime(referenceDate, referenceTime);
    if (base && selectedAngles.size > 0) setResults(calculateResults(base, selectedAngles, windowDays));
  }, []);

  const filteredResults = useMemo(() => results.filter((result) => month === 'All Months' || monthFor(result.pressureDate) === month), [results, month]);
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));
  const visibleResults = filteredResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allAnglesSelected = selectedAngles.size === ANGLES.length;
  const baseDate = calculationBase === 'financial' ? parseDateTime(financialDate, financialTime) : parseDateTime(referenceDate, referenceTime);

  function calculateResults(base: Date, angles: Set<number>, days: number): GannPressureResult[] {
    return [...angles].sort((a, b) => a - b).map((angle) => {
      const calculatedDays = (angle / 360) * 365.25;
      const pressureDate = addDaysExact(base, calculatedDays);
      return { angle, days: calculatedDays, pressureDate, pressureTime: formatTime(pressureDate), windowStart: addDaysExact(pressureDate, -days), windowEnd: addDaysExact(pressureDate, days), important: IMPORTANT_ANGLES.has(angle) };
    });
  }

  function calculate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const selectedBase = calculationBase === 'financial' ? parseDateTime(financialDate, financialTime) : parseDateTime(referenceDate, referenceTime);
    if (!selectedBase) { setError('Please provide valid date and time values before calculating.'); return; }
    if (!referenceDate) { setError('Reference Date is required for calculation.'); return; }
    if (selectedAngles.size === 0) { setError('Select at least one Gann angle.'); return; }
    const safeWindow = Math.min(10, Math.max(0, Number.isFinite(windowDays) ? windowDays : 0));
    setWindowDays(safeWindow);
    setResults(calculateResults(selectedBase, selectedAngles, safeWindow));
    setMonth('All Months');
    setPage(1);
  }

  function toggleAngle(angle: number) {
    setSelectedAngles((current) => {
      const next = new Set(current);
      if (next.has(angle)) next.delete(angle); else next.add(angle);
      return next;
    });
    setPage(1);
  }

  function toggleAllAngles() {
    setSelectedAngles(allAnglesSelected ? new Set() : new Set(ANGLES));
    setPage(1);
  }

  function shiftMonth(direction: number) {
    const current = MONTHS.indexOf(month);
    const next = current === 0 ? (direction > 0 ? 1 : 12) : ((current - 1 + direction + 12) % 12) + 1;
    setMonth(MONTHS[next]);
    setPage(1);
  }

  function updateWindow(value: string) {
    const parsed = Number(value);
    setWindowDays(Math.min(10, Math.max(0, Number.isFinite(parsed) ? parsed : 0)));
  }

  return (
    <main className="container-fluid tool-page stock-gann-page">
      <header className="page-heading-row"><div><div className="eyebrow">STOCK TOOL</div><h1 className="page-title">Stock Gann Pressure Calculator</h1><p className="page-subtitle">Probable Gann pressure dates and stock momentum observation zones</p><nav className="breadcrumb-line" aria-label="Breadcrumb"><i className="bi bi-house" /> <Link href="/dashboard">Dashboard</Link> <span>/</span> Stock Gann Pressure Calculator</nav></div><div className="page-actions"><button className="outline-action" type="button" onClick={() => setShowUsage(true)}><i className="bi bi-lightbulb" /> Use</button></div></header>

      <form className="filter-panel stock-gann-form" onSubmit={calculate}>
        <div className="filter-title"><span><i className="bi bi-calculator" /> Gann Pressure Parameters</span><span className="location-note">Mumbai, India - IST (+05:30)</span></div>
        <section className="gann-zero-section"><h2>Financial / Gann Zero Date</h2><div className="row g-3 align-items-end"><div className="col-12 col-md-5"><label htmlFor="financial-zero-date">Financial / Gann Zero Date</label><select id="financial-zero-date" value={financialDate} onChange={(event) => setFinancialDate(event.target.value)}>{FINANCIAL_ZERO_DATES.map((entry) => <option key={entry.date} value={entry.date}>{formatDate(parseDateTime(entry.date, entry.time) as Date)}</option>)}</select></div><div className="col-12 col-md-3"><label htmlFor="financial-time">Financial Time</label><input id="financial-time" value={financialTime} readOnly aria-readonly="true" /></div><div className="col-12 col-md-4"><label htmlFor="timezone">Timezone</label><input id="timezone" value="Mumbai, India - IST (+05:30)" readOnly aria-readonly="true" /></div></div></section>

        <fieldset className="calculation-base"><legend>Calculation Base</legend><div className="row g-2"><div className="col-12 col-md-6"><label className="radio-option"><input type="radio" name="calculation-base" value="financial" checked={calculationBase === 'financial'} onChange={() => setCalculationBase('financial')} /> Financial / Gann Zero Date</label></div><div className="col-12 col-md-6"><label className="radio-option"><input type="radio" name="calculation-base" value="stock" checked={calculationBase === 'stock'} onChange={() => setCalculationBase('stock')} /> Stock Reference Date</label></div></div></fieldset>

        <section className="stock-reference-section"><h2>Stock Reference Date</h2><div className="row g-3 align-items-end"><div className="col-12 col-md-3"><label htmlFor="reference-date">Reference Date</label><input id="reference-date" type="date" required value={referenceDate} onChange={(event) => setReferenceDate(event.target.value)} /></div><div className="col-12 col-md-2"><label htmlFor="reference-time">Reference Time</label><input id="reference-time" type="time" value={referenceTime} onChange={(event) => setReferenceTime(event.target.value)} /></div><div className="col-12 col-md-3"><label htmlFor="reference-type">Reference Type</label><select id="reference-type" value={referenceType} onChange={(event) => setReferenceType(event.target.value as ReferenceType)}><option>Major High</option><option>Major Low</option></select></div><div className="col-12 col-md-2"><label htmlFor="timeframe">Timeframe</label><select id="timeframe" value={timeframe} onChange={(event) => setTimeframe(event.target.value as Timeframe)}><option>4 Hour</option><option>Daily</option><option>Weekly</option></select></div><div className="col-12 col-md-2"><label htmlFor="window-days">Tentative Window (Days)</label><input id="window-days" type="number" min="0" max="10" value={windowDays} onChange={(event) => updateWindow(event.target.value)} /></div></div></section>

        <fieldset className="angles-section"><legend>Gann Angles</legend><div className="angle-toolbar"><label className="angle-select-all"><input type="checkbox" checked={allAnglesSelected} onChange={toggleAllAngles} /> Select All</label><span>{selectedAngles.size} of {ANGLES.length} selected</span></div><div className="angle-grid">{ANGLES.map((angle) => <label className={`angle-option ${IMPORTANT_ANGLES.has(angle) ? 'important-angle' : ''} ${selectedAngles.has(angle) ? 'selected' : ''}`} key={angle}><input type="checkbox" checked={selectedAngles.has(angle)} onChange={() => toggleAngle(angle)} /><span>{angle}°</span></label>)}</div></fieldset>
        {error && <div className="calculator-error" role="alert"><i className="bi bi-exclamation-circle" /> {error}</div>}
        <button className="gold-action calculate-gann-button" type="submit"><i className="bi bi-lightning-charge" /> Calculate Gann Pressure Dates</button>
      </form>

      {results.length > 0 && baseDate && <section className="calculation-summary" aria-label="Calculation summary"><div><strong>Financial / Gann Zero</strong><span>{financialDate ? `${formatDate(parseDateTime(financialDate, financialTime) as Date)} ${financialTime} IST` : 'Not set'}</span></div><div><strong>Stock Reference</strong><span>{referenceDate ? `${formatDate(parseDateTime(referenceDate, referenceTime) as Date)} ${referenceTime} IST` : 'Not set'}</span></div><div><strong>{referenceType}</strong><span>Base: {calculationBase === 'financial' ? 'Financial / Gann Zero Date' : 'Stock Reference Date'}</span></div><div><strong>Timeframe: {timeframe}</strong><span>Timezone: Mumbai, India - IST (+05:30)</span></div><div><strong>Tentative Window: ±{windowDays} Days</strong><span>Probable pressure zone, not a guaranteed signal.</span></div></section>}

      <section className="data-panel gann-results"><div className="data-panel-heading"><div><span className="eyebrow">PRESSURE DATE ANALYSIS</span><h2>Probable Gann Pressure Dates</h2></div><div className="month-navigation"><button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month"><i className="bi bi-chevron-left" /></button><select value={month} onChange={(event) => { setMonth(event.target.value); setPage(1); }} aria-label="Filter results by month">{MONTHS.map((item) => <option key={item}>{item}</option>)}</select><button type="button" onClick={() => shiftMonth(1)} aria-label="Next month"><i className="bi bi-chevron-right" /></button></div></div>{visibleResults.length === 0 ? <div className="state-panel"><i className="bi bi-calendar-x" /><strong>No pressure dates match this month.</strong><button className="subtle-action" type="button" onClick={() => { setMonth('All Months'); setPage(1); }}>Show All Months</button></div> : <><div className="table-responsive"><table className="analysis-table gann-pressure-table"><caption className="visually-hidden">Calculated Gann pressure dates</caption><thead><tr><th>Pressure Date</th><th>Day</th><th>Priority</th><th>Window</th><th>Angle</th><th>India Time</th></tr></thead><tbody>{visibleResults.map((result) => <tr className={`${result.important ? 'important-result' : 'secondary-result'} ${isWeekend(result.pressureDate) ? 'weekend-row' : ''}`} key={result.angle}><td data-label="Pressure Date"><strong>{formatDate(result.pressureDate)}</strong></td><td data-label="Day">{formatDay(result.pressureDate)} {isWeekend(result.pressureDate) && <span className="status-badge weekend-status">Weekend</span>}</td><td data-label="Priority"><span className={`status-badge ${result.important ? 'priority-important' : 'priority-secondary'}`}>{result.important ? 'IMPORTANT' : 'SECONDARY'}</span></td><td data-label="Window">{formatDate(result.windowStart)} - {formatDate(result.windowEnd)}</td><td data-label="Angle"><span className="degree-badge">{result.angle}°</span></td><td data-label="India Time">{result.pressureTime}</td></tr>)}</tbody></table></div><div className="pagination-row"><span>Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredResults.length)} of {filteredResults.length} results</span><div className="pagination-controls"><button className="subtle-action" type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => <button className={`subtle-action ${page === item ? 'current-page' : ''}`} type="button" key={item} onClick={() => setPage(item)} aria-current={page === item ? 'page' : undefined}>{item}</button>)}<button className="subtle-action" type="button" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button></div></div></>}</section>

      <section className="data-panel gann-observation"><div className="data-panel-heading"><div><span className="eyebrow">OBSERVATION GUIDANCE</span><h2>Pressure Zone Interpretation</h2></div><i className="bi bi-shield-check" /></div><p className="modal-copy">This calculator provides probable time and pressure zones from a selected base date and Gann angle. During the tentative window, analyze 4H High/Low and momentum using actual market data.</p><p className="modal-note"><i className="bi bi-exclamation-triangle" /> Gann pressure dates do not guarantee 100% accuracy and are not confirmed Buy/Sell signals. Technical and market-data confirmation is required.</p></section>

      {showUsage && <div className="modal-backdrop-custom" role="presentation" onClick={() => setShowUsage(false)}><div className="detail-modal rules-modal gann-usage-modal" role="dialog" aria-modal="true" aria-labelledby="gann-usage-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">STOCK TOOL</span><h2 id="gann-usage-title">Stock Momentum Analysis - Gann + Astrology</h2></div><button type="button" onClick={() => setShowUsage(false)} aria-label="Close strategy"><i className="bi bi-x-lg" /></button></div><div className="gann-modal-body"><ol className="rules-list degree-steps"><li>Check the stock structure on the <strong>4H timeframe</strong>.</li><li>If the stock has fallen significantly, identify the <strong>Recently Major High</strong>.</li><li>If the stock has risen significantly, identify the <strong>Recently Major Low</strong>.</li><li>Preferably select a High/Low within the last <strong>1 year</strong>.</li><li>Mark the date of that High/Low and use it as the Start Date / Stock Reference Date.</li><li>Support Gann Angles: <strong>30°, 45°, 60°, 90°, 120°, 135°, 144°, 180°, 216°, 225°, 240°, 270°, 315°, 360°</strong>.</li><li>Important Angles are <strong>45°, 90°, 135°, 180°, 225°, 270°, 315°, 360°</strong>.</li><li>Calculate the probable Pressure Date and configurable Tentative Window.</li><li>During the tentative window, analyze 4H High/Low and Momentum.</li></ol><div className="warning-note"><strong>This tool does not guarantee 100% accuracy. It provides only probable time/pressure zones.</strong></div></div><div className="modal-footer-actions"><button className="subtle-action" type="button" onClick={() => setShowUsage(false)}>Close</button></div></div></div>}
    </main>
  );
}
