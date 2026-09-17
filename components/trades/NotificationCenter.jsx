'use client';

import { useEffect, useState } from 'react';
import TradeDetailsModal from './TradeDetailsModal';

export default function NotificationCenter() {
  const [trades, setTrades] = useState([]);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(0);

  async function load() {
    try {
      const response = await fetch('/api/stock-trades', { cache: 'no-store' });
      const payload = await response.json();
      if (payload.success) setTrades(payload.data || []);
    } catch {
      // Notifications are supplemental and should not block the application shell.
    }
  }

  useEffect(() => {
    load();
    setNow(Date.now());
    const timer = window.setInterval(() => {
      setNow(Date.now());
      load();
    }, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const due = trades.flatMap((trade) => (trade.notification?.events || []).filter((event) => event.status === 'triggered' && new Date(event.scheduledAt).getTime() <= now).map((event) => ({ trade, event })));

  async function openNotification(item) {
    setSelected({ ...item.trade, __notificationEvent: item.event });
    setOpen(false);
    await fetch(`/api/stock-trades/${encodeURIComponent(item.trade.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'read', notificationId: item.event.id }) });
    load();
  }

  return <div className="notification-center">
    <button type="button" className="notification-button" onClick={() => setOpen((value) => !value)} aria-label={`${due.length} trade notifications`} aria-expanded={open}>
      <i className="bi bi-bell" aria-hidden="true" /> {due.length > 0 && <span className="notification-count">{due.length}</span>}
    </button>
    {open && <div className="notification-menu" role="menu"><div className="notification-menu-title">Trade Notifications</div>{due.length === 0 ? <div className="notification-empty">No due notifications.</div> : due.map((item) => <button type="button" role="menuitem" className="notification-item" key={item.event.id} onClick={() => openNotification(item)}><strong>{item.trade.stock} - {item.trade.tradeType} - ₹{item.trade.entryPrice}</strong><span>{item.event.interval} Day Trade Update · Click to view</span></button>)}</div>}
    <TradeDetailsModal trade={selected} notificationEvent={selected?.__notificationEvent} onClose={() => setSelected(null)} onUpdated={(updated) => { setTrades((current) => current.map((trade) => trade.id === updated.id ? updated : trade)); setSelected({ ...updated, __notificationEvent: selected?.__notificationEvent }); }} />
  </div>;
}
