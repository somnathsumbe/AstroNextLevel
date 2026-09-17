'use client';

import { useEffect, useState } from 'react';

function todayValue() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

export default function TradeFormModal({ record, existingTrade, onClose, onSaved }) {
  const stock = record?.stock || record?.Stock || '';
  const gannAngle = record?.angle ?? record?.Angle ?? '';
  const defaultNotes = gannAngle === '' ? '' : `Gann Angle: ${gannAngle}°`;
  const [form, setForm] = useState({ stock, tradeType: 'BUY', tradeDate: todayValue(), tradeTime: new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()), entryPrice: '', quantity: '', targetPrice: '', stopLoss: '', duration: '7D', intervals: [7], notes: '' });
  const [state, setState] = useState({ loading: false, error: '', success: '' });

  useEffect(() => {
    setForm((current) => existingTrade ? { ...current, stock, tradeType: existingTrade.tradeType, tradeDate: existingTrade.tradeDate, tradeTime: existingTrade.tradeTime, entryPrice: existingTrade.entryPrice, quantity: existingTrade.quantity, targetPrice: existingTrade.targetPrice || '', stopLoss: existingTrade.stopLoss || '', intervals: existingTrade.notification?.intervals || [7], notes: existingTrade.notes || defaultNotes } : { ...current, stock, notes: defaultNotes });
  }, [defaultNotes, existingTrade, stock]);

  if (!record) return null;

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function toggleInterval(interval) {
    setForm((current) => ({ ...current, intervals: current.intervals.includes(interval) ? current.intervals.filter((value) => value !== interval) : [...current.intervals, interval].sort((left, right) => left - right) }));
  }

  async function submit(event) {
    event.preventDefault();
    setState({ loading: true, error: '', success: '' });
    try {
      const endpoint = existingTrade ? `/api/stock-trades/${encodeURIComponent(existingTrade.id)}` : '/api/stock-trades';
      const body = existingTrade ? { action: 'configure', enabled: true, intervals: form.intervals } : { ...form, marketReference: { gannAngle: record.angle ?? record.Angle, pressureDate: record.PressureDate || record.pressureDate, planet: record.planet || record.Planet, sector: record.sector || record.Sector, referenceType: record.ReferenceType } };
      const response = await fetch(endpoint, { method: existingTrade ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error?.message || 'Unable to save trade.');
      setState({ loading: false, error: '', success: 'Trade saved successfully.' });
      onSaved?.(payload.data);
      window.setTimeout(onClose, 500);
    } catch (error) {
      setState({ loading: false, error: error.message, success: '' });
    }
  }

  return <div className="modal-backdrop-custom" role="presentation" onClick={(event) => event.target === event.currentTarget && onClose()}>
    <section className="detail-modal trade-form-modal" role="dialog" aria-modal="true" aria-labelledby="trade-form-title">
      <div className="modal-top"><div><span className="eyebrow">TRADE / NOTIFICATION</span><h2 id="trade-form-title">Configure {stock}</h2></div><button type="button" className="modal-close" onClick={onClose} aria-label="Close trade form"><i className="bi bi-x-lg" /></button></div>
      <form onSubmit={submit}>
        <div className="row g-3">
          <div className="col-6"><label className="form-label" htmlFor="trade-type">Trade Type</label><select id="trade-type" name="tradeType" className="form-select" value={form.tradeType} onChange={change}><option>BUY</option><option>SELL</option></select></div>
          <div className="col-12"><span className="form-label">Notification Duration</span><div className="trade-interval-options">{[[7, '7 Days'], [14, '14 Days']].map(([interval, label]) => <label className="form-check form-check-inline" key={interval}><input className="form-check-input" type="checkbox" checked={form.intervals.includes(interval)} onChange={() => toggleInterval(interval)} /><span className="form-check-label">{label}</span></label>)}</div></div>
          <div className="col-6"><label className="form-label" htmlFor="trade-date">Trade Date</label><input id="trade-date" name="tradeDate" type="date" className="form-control" value={form.tradeDate} onChange={change} required /></div>
          <div className="col-6"><label className="form-label" htmlFor="trade-time">Trade Time</label><input id="trade-time" name="tradeTime" type="time" className="form-control" value={form.tradeTime} onChange={change} required /></div>
          <div className="col-6"><label className="form-label" htmlFor="entry-price">Entry Price</label><input id="entry-price" name="entryPrice" type="number" min="0.01" step="0.01" className="form-control" value={form.entryPrice} onChange={change} required /></div>
          <div className="col-6"><label className="form-label" htmlFor="trade-quantity">Quantity</label><input id="trade-quantity" name="quantity" type="number" min="0.0001" step="any" className="form-control" value={form.quantity} onChange={change} required /></div>
          <div className="col-6"><label className="form-label" htmlFor="target-price">Target Price</label><input id="target-price" name="targetPrice" type="number" min="0.01" step="0.01" className="form-control" value={form.targetPrice} onChange={change} /></div>
          <div className="col-6"><label className="form-label" htmlFor="stop-loss">Stop Loss</label><input id="stop-loss" name="stopLoss" type="number" min="0.01" step="0.01" className="form-control" value={form.stopLoss} onChange={change} /></div>
          <div className="col-12"><label className="form-label" htmlFor="trade-notes">Notes</label><textarea id="trade-notes" name="notes" className="form-control" rows="2" value={form.notes} onChange={change} maxLength="1000" /></div>
        </div>
        {state.error && <div className="alert alert-danger mt-3 mb-0" role="alert">{state.error}</div>}
        {state.success && <div className="alert alert-success mt-3 mb-0" role="status">{state.success}</div>}
        <div className="d-flex justify-content-end gap-2 mt-4"><button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary" disabled={state.loading}>{state.loading ? 'Saving...' : 'Save Trade'}</button></div>
      </form>
    </section>
  </div>;
}
