'use client';

import { useEffect, useState } from 'react';

export default function TradeDetailsModal({ trade, notificationEvent, onClose, onUpdated }) {
  const [form, setForm] = useState({ exitType: trade?.tradeType || 'BUY', exitPrice: '', exitDate: new Date().toISOString().slice(0, 10), resultStatus: 'SUCCESS', notes: trade?.notes || '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (trade) setForm((current) => ({ ...current, exitType: trade.tradeType, notes: trade.notes || '' }));
  }, [trade]);

  if (!trade) return null;
  const result = trade.result?.profitLoss;

  async function saveReview(event) {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch(`/api/stock-trades/${encodeURIComponent(trade.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error?.message || 'Unable to update trade.');
      onUpdated?.(payload.data);
      onClose();
    } catch (reviewError) {
      setError(reviewError.message);
    }
  }

  async function saveNotificationExit(event) {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch(`/api/stock-trades/${encodeURIComponent(trade.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'exit', notificationId: notificationEvent.id, exitPrice: form.exitPrice }) });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error?.message || 'Unable to save exit price.');
      onUpdated?.(payload.data);
      onClose();
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  return <div className="modal-backdrop-custom" role="presentation" onClick={(event) => event.target === event.currentTarget && onClose()}>
    <section className="detail-modal trade-detail-modal" role="dialog" aria-modal="true" aria-labelledby="trade-detail-title">
      <div className="modal-top"><div><span className="eyebrow">TRADE DETAILS</span><h2 id="trade-detail-title">{trade.stock} / {trade.tradeType}</h2></div><button type="button" className="modal-close" onClick={onClose} aria-label="Close trade details"><i className="bi bi-x-lg" /></button></div>
      <div className="row g-3 small"><div className="col-6"><strong>Date</strong><div>{trade.tradeDate} {trade.tradeTime}</div></div><div className="col-6"><strong>Entry</strong><div>₹{trade.entryPrice} × {trade.quantity}</div></div><div className="col-6"><strong>Target / Stop</strong><div>{trade.targetPrice ?? '-'} / {trade.stopLoss ?? '-'}</div></div><div className="col-6"><strong>Notification</strong><div>{notificationEvent ? `${notificationEvent.interval} Min · ${notificationEvent.status}` : `${trade.notification.duration} · ${trade.notification.status}`}</div></div><div className="col-12"><strong>Due at</strong><div>{notificationEvent?.scheduledAt || trade.notification.notificationDateTime}</div></div><div className="col-12"><strong>Notes</strong><div>{trade.notes || '-'}</div></div>{notificationEvent && <div className="col-12"><strong>Interval Price</strong><div>{notificationEvent.price ? `₹${notificationEvent.price}` : 'Current price unavailable from the configured stock source.'}</div></div>}{result !== null && <div className="col-12"><strong>Current P&amp;L</strong><div className={result >= 0 ? 'text-success' : 'text-danger'}>₹{result} ({trade.result.profitLossPercent}%)</div></div>}</div>
      {notificationEvent && <form className="trade-notification-exit-form" onSubmit={saveNotificationExit}><h3 className="h6 mt-4">Trade Update · {notificationEvent.interval} Min</h3><label className="form-label" htmlFor="notification-exit-price">Exit Price</label><input id="notification-exit-price" className="form-control" type="number" min="0.01" step="0.01" value={form.exitPrice} onChange={(event) => setForm({ ...form, exitPrice: event.target.value })} required /><div className="d-flex justify-content-end mt-3"><button type="submit" className="btn btn-primary">Save Exit Price</button></div></form>}
      {!notificationEvent && <div className="trade-interval-tracking mt-4"><h3 className="h6">Interval Tracking</h3><div className="table-responsive"><table className="table analysis-table"><thead><tr><th>Interval</th><th>Price</th><th>Change</th><th>Change %</th><th>Exit</th><th>Status</th></tr></thead><tbody>{(trade.notification.events || []).map((event) => <tr key={event.id}><td>{event.interval} Days</td><td>{event.price ?? '-'}</td><td>{event.change ?? '-'}</td><td>{event.changePercent ?? '-'}%</td><td>{event.exitPrice ?? '-'}</td><td>{event.status}</td></tr>)}</tbody></table></div></div>}
      <hr />
      <h3 className="h6">Backtesting Review</h3>
      <form onSubmit={saveReview}><div className="row g-3"><div className="col-4"><label className="form-label" htmlFor="exit-type">Exit Type</label><select id="exit-type" className="form-select" value={form.exitType} onChange={(event) => setForm({ ...form, exitType: event.target.value })}><option>BUY</option><option>SELL</option></select></div><div className="col-4"><label className="form-label" htmlFor="exit-price">Exit Price</label><input id="exit-price" className="form-control" type="number" min="0.01" step="0.01" value={form.exitPrice} onChange={(event) => setForm({ ...form, exitPrice: event.target.value })} required /></div><div className="col-4"><label className="form-label" htmlFor="exit-date">Exit Date</label><input id="exit-date" className="form-control" type="date" value={form.exitDate} onChange={(event) => setForm({ ...form, exitDate: event.target.value })} required /></div><div className="col-12"><label className="form-label" htmlFor="review-notes">Review Notes</label><textarea id="review-notes" className="form-control" rows="2" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></div></div>{error && <div className="alert alert-danger mt-3 mb-0" role="alert">{error}</div>}<div className="d-flex justify-content-end gap-2 mt-4"><button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button><button type="submit" className="btn btn-primary">Save Review</button></div></form>
    </section>
  </div>;
}

