'use client';

import { useEffect, useMemo, useState } from 'react';
import GannFilters from '@/components/gann/GannFilters';
import GannHeader from '@/components/gann/GannHeader';
import GannSummary from '@/components/gann/GannSummary';
import GannTable from '@/components/gann/GannTable';
import { getIndiaTodayKey, isTodayPressureDate, normalizePressureRecords, pressureDateKey } from '@/components/gann/GannUtils';

const initialFilters = { stock: 'all', planet: 'all', today: 'all', priority: 'all', search: '' };

function dateKeyFromValue(value) {
  const [year, month, day] = String(value).split('-').map(Number);
  if (!year || !month || !day) return '';
  const date = new Date(year, month - 1, day);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function relativeDateKey(baseKey, offsetDays) {
  const baseDate = new Date(`${baseKey}T00:00:00+05:30`);
  baseDate.setDate(baseDate.getDate() + offsetDays);
  return dateKeyFromValue(`${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, '0')}-${String(baseDate.getDate()).padStart(2, '0')}`);
}

export default function TodayStockPage() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const todayKey = getIndiaTodayKey();

  useEffect(() => {
    fetch('/data/gann-pressure-dates.json')
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load pressure date data.');
        return response.json();
      })
      .then((records) => setData(normalizePressureRecords(records)))
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const options = useMemo(() => ({
    stocks: [...new Set(data.map((item) => item.stock).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    planets: [...new Set(data.map((item) => item.planet).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    priorities: [...new Set(data.map((item) => item.priority).filter(Boolean))].sort((a, b) => a.localeCompare(b))
  }), [data]);

  const icons = useMemo(() => data.reduce((result, item) => {
    if (item.planet && item.planetIcon && !String(item.planetIcon).includes('ð')) result[item.planet] = item.planetIcon;
    return result;
  }, {}), [data]);

  const filteredData = useMemo(() => data.filter((item) => {
    const pressureDateValue = item.PressureDate || item.pressureDate || '';
    const itemDateKey = pressureDateKey(pressureDateValue);
    const matchesDateFilter = (() => {
      if (filters.today === 'all') return true;
      if (filters.today === 'lastday') return itemDateKey && itemDateKey === relativeDateKey(todayKey, -1);
      if (filters.today === 'today') return itemDateKey && itemDateKey === todayKey;
      if (filters.today === 'upcoming') return itemDateKey && itemDateKey === relativeDateKey(todayKey, 1);
      return true;
    })();

    return (filters.stock === 'all' || item.stock === filters.stock) &&
      (filters.planet === 'all' || item.planet === filters.planet) &&
      matchesDateFilter &&
      (filters.priority === 'all' || String(item.priority).toLowerCase() === String(filters.priority).toLowerCase()) &&
      (!filters.search || String(item.stock || '').toLowerCase().includes(filters.search.trim().toLowerCase()));
  }), [data, filters, todayKey]);

  const summary = useMemo(() => ({
    stocks: options.stocks.length,
    records: data.length,
    high: data.filter((item) => String(item.priority).toLowerCase() === 'high').length,
    today: data.filter((item) => isTodayPressureDate(item.PressureDate, todayKey)).length
  }), [data, options.stocks.length, todayKey]);

  function updateFilter(key, value) { setFilters((current) => ({ ...current, [key]: value })); }

  return <main className="container-fluid tool-page today-stock-page"><GannHeader /><GannSummary summary={summary} /><GannFilters values={filters} options={options} icons={icons} onChange={updateFilter} onReset={() => setFilters(initialFilters)} />{loading && <div className="state-panel gann-loading"><i className="bi bi-arrow-repeat" /><strong>Loading pressure dates...</strong></div>}{error && <div className="calculator-error" role="alert"><i className="bi bi-exclamation-circle" /> {error}</div>}{!loading && !error && <GannTable rows={filteredData} total={data.length} todayKey={todayKey} todayFilter={filters.today} />}</main>;
}