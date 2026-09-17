"use client";

import { useEffect, useState } from "react";
import GannTable from "./GannTable";
import { publicDataService } from "@/lib/data/services/public-data.service";
import { stockService } from "@/lib/data/services/stock.service";
import ErrorState from "@/components/ui/ErrorState";
import SectionHeader from "@/components/common/SectionHeader";
import Skeleton from "@/components/ui/Skeleton";
import TradeFormModal from "@/components/trades/TradeFormModal";
import {
  getIndiaTodayKey,
  normalizePressureRecords,
  pressureDateKey,
} from "./GannUtils";

export default function CurrentDayStock() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const todayKey = getIndiaTodayKey();
  const [showingUpcoming, setShowingUpcoming] = useState(false);
  const [tradeRecord, setTradeRecord] = useState(null);
  const [trades, setTrades] = useState([]);
  const [existingTrade, setExistingTrade] = useState(null);

  async function loadTradeData() {
    try {
      const response = await fetch('/api/stock-trades', { cache: 'no-store' });
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) return [];
      const payload = await response.json();
      return payload.data || [];
    } catch {
      return [];
    }
  }

  useEffect(() => {
    Promise.all([
      stockService.getTodayStockRecords()
      .catch(() => publicDataService.getGannPressureData())
      .then(async (payload) => {
        const todayRecords = normalizePressureRecords(payload.data || payload || []);
        if (todayRecords.length) {
          setData(todayRecords);
          return;
        }

        const allPayload = await stockService.getAllStockRecords().catch(() => publicDataService.getGannPressureData());
        setData(normalizePressureRecords(allPayload.data || allPayload || []));
        setShowingUpcoming(true);
      }),
      loadTradeData().then(setTrades),
    ])
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const tradeByStock = Object.fromEntries(trades.map((trade) => [trade.stock, trade]));

  async function toggleNotification(record, enabled) {
    const stock = record.stock || record.Stock;
    const trade = tradeByStock[stock];
    if (enabled) {
      setTradeRecord(record);
      setExistingTrade(trade || null);
      return;
    }
    if (!trade) return;
    const response = await fetch(`/api/stock-trades/${encodeURIComponent(trade.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'configure', enabled: false, intervals: trade.notification.intervals || [5] }) });
    const payload = await response.json();
    if (payload.success) setTrades((current) => current.map((item) => item.id === payload.data.id ? payload.data : item));
  }

  function handleTradeSaved(savedTrade) {
    setTrades((current) => [...current.filter((trade) => trade.id !== savedTrade.id && trade.stock !== savedTrade.stock), savedTrade]);
    setExistingTrade(savedTrade);
  }

  const todayRows = data.filter((item) => pressureDateKey(item.PressureDate || item.pressureDate) === todayKey);
  const upcomingDate = data
    .map((item) => pressureDateKey(item.PressureDate || item.pressureDate))
    .filter((date) => date >= todayKey)
    .sort()[0];
  const currentDayRows = todayRows.length
    ? todayRows
    : upcomingDate
      ? data.filter((item) => pressureDateKey(item.PressureDate || item.pressureDate) === upcomingDate)
      : data.slice(0, 20);

  if (loading) {
    return (
      <section className="data-panel dashboard-current-day-stock">
        <div className="dashboard-stock-loading" role="status"><Skeleton height="22px" width="190px" /><Skeleton className="mt-3" height="70px" /><Skeleton className="mt-2" height="70px" /></div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="data-panel dashboard-current-day-stock">
        <ErrorState title="Unable to load current stocks" description={error || 'Current stock pressure data is unavailable.'} />
      </section>
    );
  }

  return (
    <div className="dashboard-current-day-stock">
      <SectionHeader className="compact dashboard-current-day-stock-heading" title={showingUpcoming && !todayRows.length ? "Available Pressure Stocks" : "Current Day Stock"} icon="bi-bar-chart-line" />
      <GannTable
        rows={currentDayRows}
        total={currentDayRows.length}
        todayKey={todayKey}
        todayFilter={showingUpcoming && !todayRows.length ? "upcoming" : "today"}
        onConfigureTrade={setTradeRecord}
        tradeByStock={tradeByStock}
        onToggleNotification={toggleNotification}
      />
      <TradeFormModal record={tradeRecord} existingTrade={existingTrade} onClose={() => { setTradeRecord(null); setExistingTrade(null); }} onSaved={handleTradeSaved} />
    </div>
  );
}
