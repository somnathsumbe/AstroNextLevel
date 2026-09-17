'use client';

import { useEffect, useMemo, useState } from 'react';
import TradeDetailsModal from '@/components/trades/TradeDetailsModal';

const PAGE_SIZE = 20;
const initialFilters = { stock: 'all', result: 'all', tradeType: 'all', fromDate: '', toDate: '', duration: 'all' };

export default function StockBacktestingPage() {
  const [trades, setTrades] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  async function loadTrades() {
    try {
      const response = await fetch('/api/stock-trades', { cache: 'no-store' });
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) {
        setTrades([]);
        return;
      }
      const payload = await response.json();
      if (!payload.success) throw new Error(payload.error?.message || 'Unable to load trades.');
      setTrades(payload.data || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => { loadTrades(); }, []);

  const stocks = useMemo(() => [...new Set(trades.map((trade) => trade.stock))].sort(), [trades]);
  const filtered = useMemo(() => trades.filter((trade) => (
    (filters.stock === 'all' || trade.stock === filters.stock) &&
    (filters.result === 'all' || trade.result.status === filters.result) &&
    (filters.tradeType === 'all' || trade.tradeType === filters.tradeType) &&
    (filters.duration === 'all' || trade.notification.duration === filters.duration) &&
    (!filters.fromDate || trade.tradeDate >= filters.fromDate) &&
    (!filters.toDate || trade.tradeDate <= filters.toDate)
  )), [filters, trades]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const summary = useMemo(() => {
    const completed = trades.filter((trade) => trade.result.status !== 'PENDING');
    const totalProfitLoss = completed.reduce((sum, trade) => sum + (trade.result.profitLoss || 0), 0);
    return { total: trades.length, pending: trades.filter((trade) => trade.result.status === 'PENDING').length, success: trades.filter((trade) => trade.result.status === 'SUCCESS').length, failed: trades.filter((trade) => trade.result.status === 'FAILED').length, totalProfitLoss: totalProfitLoss.toFixed(2), successRate: completed.length ? ((trades.filter((trade) => trade.result.status === 'SUCCESS').length / completed.length) * 100).toFixed(1) : '0.0' };
  }, [trades]);

  function updateFilter(key, value) { setFilters((current) => ({ ...current, [key]: value })); setPage(1); }

  async function deleteTrade(trade) {
    if (!window.confirm(`Delete the complete trade for ${trade.stock}? This cannot be undone.`)) return;
    try {
      const response = await fetch(`/api/stock-trades/${encodeURIComponent(trade.id)}`, { method: 'DELETE' });
      const payload = response.status === 204 ? { success: true } : await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error?.message || 'Unable to delete trade.');
      setTrades((current) => current.filter((item) => item.id !== trade.id));
      setSelected((current) => current?.id === trade.id ? null : current);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return <main className="container-fluid tool-page stock-backtesting-page">
    <header className="page-heading-row"><div><span className="eyebrow">MARKET REVIEW / PERSISTENT TRADES</span><h1 className="page-title">Stock Backtesting</h1><p className="page-subtitle">Review saved trade notifications and outcomes.</p></div></header>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    <section className="row g-3 mb-4" aria-label="Backtesting summary">{[['Total Trades', summary.total], ['Pending', summary.pending], ['Success', summary.success], ['Failed', summary.failed], ['Total P&L', `₹${summary.totalProfitLoss}`], ['Success Rate', `${summary.successRate}%`]].map(([label, value]) => <div className="col-6 col-md-4 col-xl-2" key={label}><div className="summary-card"><span className="metric-label">{label}</span><strong>{value}</strong></div></div>)}</section>
    <section className="filter-panel mb-4" aria-label="Backtesting filters"><div className="row g-3 align-items-end"><div className="col-12 col-md-2"><label htmlFor="backtest-stock">Stock</label><select id="backtest-stock" className="form-select" value={filters.stock} onChange={(event) => updateFilter('stock', event.target.value)}><option value="all">All Stocks</option>{stocks.map((stock) => <option key={stock}>{stock}</option>)}</select></div><div className="col-6 col-md-2"><label htmlFor="backtest-result">Result</label><select id="backtest-result" className="form-select" value={filters.result} onChange={(event) => updateFilter('result', event.target.value)}><option value="all">All</option><option value="PENDING">Pending</option><option value="SUCCESS">Success</option><option value="FAILED">Failed</option></select></div><div className="col-6 col-md-2"><label htmlFor="backtest-type">Trade Type</label><select id="backtest-type" className="form-select" value={filters.tradeType} onChange={(event) => updateFilter('tradeType', event.target.value)}><option value="all">All</option><option>BUY</option><option>SELL</option></select></div><div className="col-6 col-md-2"><label htmlFor="backtest-duration">Duration</label><select id="backtest-duration" className="form-select" value={filters.duration} onChange={(event) => updateFilter('duration', event.target.value)}><option value="all">All</option><option value="1M">1 Minute</option><option value="2M">2 Minutes</option><option value="7D">7 Days</option><option value="14D">14 Days</option><option value="21D">21 Days</option></select></div><div className="col-6 col-md-2"><label htmlFor="backtest-from">From Date</label><input id="backtest-from" type="date" className="form-control" value={filters.fromDate} onChange={(event) => updateFilter('fromDate', event.target.value)} /></div><div className="col-6 col-md-2"><label htmlFor="backtest-to">To Date</label><input id="backtest-to" type="date" className="form-control" value={filters.toDate} onChange={(event) => updateFilter('toDate', event.target.value)} /></div></div></section>
    <section className="data-panel"><div className="data-panel-heading"><h2>Saved Trades</h2><span className="location-note">Showing {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span></div><div className="table-responsive"><table className="table analysis-table"><caption className="visually-hidden">Saved stock trades</caption><thead><tr><th>Date</th><th>Stock</th><th>Type</th><th>Entry</th><th>Exit</th><th>Qty</th><th>P&amp;L</th><th>P&amp;L %</th><th>Notification</th><th>Result</th><th>Action</th></tr></thead><tbody>{visible.length === 0 ? <tr><td colSpan="11"><div className="backtest-empty-state"><i className="bi bi-clipboard-data" aria-hidden="true" /><strong>No saved trades yet.</strong><span>Configure a stock notification from the Dashboard to create the first backtesting record.</span></div></td></tr> : visible.map((trade) => { const intervals = trade.notification.intervals?.length ? trade.notification.intervals : [trade.notification.duration === '15M' ? 15 : 5]; const events = trade.notification.events || []; return <tr key={trade.id}><td>{trade.tradeDate}</td><td><strong>{trade.stock}</strong></td><td>{trade.tradeType}</td><td>₹{trade.entryPrice}</td><td>{trade.review.exitPrice ? `₹${trade.review.exitPrice}` : '-'}</td><td>{trade.quantity}</td><td className={trade.result.profitLoss >= 0 ? 'text-success' : 'text-danger'}>{trade.result.profitLoss ?? '-'}</td><td>{trade.result.profitLossPercent ?? '-'}%</td><td><span className="badge bg-secondary">{trade.notification.status}</span><div className="backtest-notification-meta">{intervals.map((interval) => { const event = events.find((item) => item.interval === interval); return <span key={interval}>{interval}m{event?.status === 'exit-saved' ? ' ✓' : event?.status === 'triggered' ? ' •' : ''}</span>; })}</div></td><td><span className={`badge ${trade.result.status === 'SUCCESS' ? 'bg-success' : trade.result.status === 'FAILED' ? 'bg-danger' : 'bg-warning text-dark'}`}>{trade.result.status}</span></td><td><div className="d-flex gap-2"><button type="button" className="subtle-action" onClick={() => setSelected(trade)}>View</button><button type="button" className="btn btn-outline-danger btn-sm" onClick={() => deleteTrade(trade)}>Delete</button></div></td></tr>; })}</tbody></table></div>{filtered.length > PAGE_SIZE && <div className="pagination-row"><span>Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span><div className="pagination-controls"><button type="button" className="subtle-action" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>{page} / {totalPages}</span><button type="button" className="subtle-action" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</button></div></div>}</section>
    <TradeDetailsModal trade={selected} onClose={() => setSelected(null)} onUpdated={(updated) => { setTrades((current) => current.map((trade) => trade.id === updated.id ? updated : trade)); setSelected(updated); }} />
  </main>;
}
