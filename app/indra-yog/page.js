'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { indraYogaService } from '@/lib/data/services/astrology/indra-yoga.service';
import {
  filterIndraYogaEntries,
  formatIndraYogaDate,
  formatIndraYogaTime,
  getIndraYogaDateKey,
  getLocalDateKey,
  isIndraYogaStartingToday,
  sortIndraYogaEntries,
} from '@/lib/indra-yoga-utils';

const MONTH_LABELS = new Map([
  ['1', 'January'], ['2', 'February'], ['3', 'March'], ['4', 'April'],
  ['5', 'May'], ['6', 'June'], ['7', 'July'], ['8', 'August'],
  ['9', 'September'], ['10', 'October'], ['11', 'November'], ['12', 'December'],
]);
const PAGE_SIZES = [5, 10, 20];

export default function IndraYogPage() {
  const [now, setNow] = useState(() => new Date());
  const [records, setRecords] = useState([]);
  const [year, setYear] = useState(() => String(new Date().getFullYear()));
  const [month, setMonth] = useState('');
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError('');
    try {
      setRecords(sortIndraYogaEntries(indraYogaService.getData()));
    } catch (loadError) {
      console.error('Unable to load IndraYog data.', loadError);
      setError('IndraYog data could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [reloadKey]);

  useEffect(() => {
    const refreshNow = () => setNow(new Date());
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refreshNow();
    };
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
    const timer = window.setTimeout(refreshNow, Math.max(nextMidnight - now.getTime() + 50, 1000));
    window.addEventListener('focus', refreshNow);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', refreshNow);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [now]);

  const years = useMemo(() => [...new Set(records.map((record) => getIndraYogaDateKey(record.begins.date).slice(0, 4)))].sort(), [records]);
  const months = useMemo(() => [...new Set(records.map((record) => String(Number(getIndraYogaDateKey(record.begins.date).slice(5, 7)))))].sort((left, right) => Number(left) - Number(right)), [records]);
  const currentYear = String(now.getFullYear());
  const todayKey = getLocalDateKey(now);
  const filteredRecords = useMemo(
    () => filterIndraYogaEntries(records, { year, month, search }),
    [records, year, month, search],
  );
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const visibleRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function clearFilters() {
    setYear(currentYear);
    setMonth('');
    setSearch('');
    setPage(1);
  }

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  return <div className="indra-yoga-page">
    <PageHeader
      eyebrow="ASTRO CALENDAR"
      title="IndraYog"
      description="Browse IndraYog occurrences and their local start and end timings."
      breadcrumb={<><Link href="/dashboard">Dashboard</Link><span>/</span>IndraYog</>}
    />

    <form className="filter-panel" onSubmit={(event) => event.preventDefault()}>
      <div className="filter-title">
        <span><i className="bi bi-sliders2" /> IndraYog Filters</span>
        <span className="filter-count">{filteredRecords.length} records</span>
      </div>
      <div className="row g-3 align-items-end">
        <div className="col-12 col-sm-6 col-xl-2">
          <label htmlFor="indra-yog-year">Year</label>
          <select id="indra-yog-year" value={year} onChange={(event) => changeFilter(setYear, event.target.value)}>
            {!years.includes(currentYear) && <option value={currentYear}>{currentYear} (no records)</option>}
            <option value="">All years</option>
            {years.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <label htmlFor="indra-yog-month">Month</label>
          <select id="indra-yog-month" value={month} onChange={(event) => changeFilter(setMonth, event.target.value)}>
            <option value="">All months</option>
            {months.map((value) => <option key={value} value={value}>{MONTH_LABELS.get(value)}</option>)}
          </select>
        </div>
        <div className="col-12 col-sm-6 col-xl-6">
          <label htmlFor="indra-yog-search">Search IndraYog records</label>
          <div className="filter-search">
            <i className="bi bi-search" aria-hidden="true" />
            <input id="indra-yog-search" type="search" value={search} onChange={(event) => changeFilter(setSearch, event.target.value)} placeholder="Date, day, yoga or time" />
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <button className="subtle-action indra-yoga-clear" type="button" onClick={clearFilters}>
            <i className="bi bi-x-circle" /> Clear filters
          </button>
        </div>
      </div>
    </form>

    <section className="data-panel" aria-labelledby="indra-yog-records-title">
      <div className="data-panel-heading">
        <div><span className="eyebrow">CALENDAR RECORDS</span><h2 id="indra-yog-records-title">IndraYog Dates</h2></div>
        <span className="location-note">Mumbai, India · source times</span>
      </div>
      {error ? <div className="state-panel" role="alert">
        <i className="bi bi-exclamation-triangle" />
        <strong>{error}</strong>
        <button className="subtle-action" type="button" onClick={() => setReloadKey((value) => value + 1)}>Retry</button>
      </div> : loading ? <div className="state-panel" role="status"><span className="spinner-border spinner-border-sm" /> Loading IndraYog data...</div> : filteredRecords.length === 0 ? <div className="state-panel">
        <i className="bi bi-calendar-x" />
        <strong>{year && !month && !search ? `No IndraYog records are available for ${year}.` : 'No IndraYog records match the selected filters.'}</strong>
        <button className="subtle-action" type="button" onClick={clearFilters}>Clear filters</button>
      </div> : <>
        <div className="indra-yoga-table-wrap">
          <table className="analysis-table indra-yoga-table">
            <caption className="visually-hidden">IndraYog start and end dates and times</caption>
            <thead><tr><th scope="col">Sr. No.</th><th scope="col">Day</th><th scope="col">Yoga Name</th><th scope="col">Begins Date</th><th scope="col">Begins Time</th><th scope="col">Ends Date</th><th scope="col">Ends Time</th></tr></thead>
            <tbody>{visibleRecords.map((record, index) => {
              const isToday = isIndraYogaStartingToday(record, now);
              return <tr className={isToday ? 'indra-yoga-today-row' : ''} key={`${record.begins.date}-${record.begins.time}-${record.yoga}`}>
              <td data-label="Sr. No.">{(page - 1) * pageSize + index + 1}</td>
              <td data-label="Day">{record.weekday}</td>
              <td data-label="Yoga Name">{record.yoga}</td>
              <td data-label="Begins Date"><strong>{formatIndraYogaDate(record.begins.date)}</strong>{isToday && <span className="indra-yoga-today-badge">TODAY</span>}</td>
              <td data-label="Begins Time">{formatIndraYogaTime(record.begins.time)}</td>
              <td data-label="Ends Date">{formatIndraYogaDate(record.ends.date)}</td>
              <td data-label="Ends Time">{formatIndraYogaTime(record.ends.time)}</td>
              </tr>;
            })}</tbody>
          </table>
        </div>
        <div className="pagination-row">
          <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredRecords.length)} of {filteredRecords.length} records · Page {page} of {totalPages}</span>
          <div className="pagination-controls">
            <label className="visually-hidden" htmlFor="indra-yog-page-size">Rows per page</label>
            <select id="indra-yog-page-size" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
              {PAGE_SIZES.map((size) => <option key={size} value={size}>{size} per page</option>)}
            </select>
            <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Previous page"><i className="bi bi-chevron-left" /></button>
            <button type="button" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} aria-label="Next page"><i className="bi bi-chevron-right" /></button>
          </div>
        </div>
      </>}
    </section>
  </div>;
}
