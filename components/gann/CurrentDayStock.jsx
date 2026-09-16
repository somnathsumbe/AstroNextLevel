"use client";

import { useEffect, useState } from "react";
import GannTable from "./GannTable";
import { publicDataService } from "@/lib/data/services/public-data.service";
import { stockService } from "@/lib/data/services/stock.service";
import ErrorState from "@/components/ui/ErrorState";
import SectionHeader from "@/components/common/SectionHeader";
import Skeleton from "@/components/ui/Skeleton";
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

  useEffect(() => {
    stockService.getTodayStockRecords()
      .catch(() => publicDataService.getGannPressureData())
      .then(async (payload) => {
        const todayRecords = normalizePressureRecords(payload.data || payload || []);
        if (todayRecords.length) {
          setData(todayRecords);
          return;
        }

        const allPayload = await stockService.getAllStockRecords();
        setData(normalizePressureRecords(allPayload.data || allPayload || []));
        setShowingUpcoming(true);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const todayRows = data.filter((item) => pressureDateKey(item.PressureDate || item.pressureDate) === todayKey);
  const upcomingDate = data
    .map((item) => pressureDateKey(item.PressureDate || item.pressureDate))
    .filter((date) => date >= todayKey)
    .sort()[0];
  const currentDayRows = todayRows.length
    ? todayRows
    : data.filter((item) => pressureDateKey(item.PressureDate || item.pressureDate) === upcomingDate);

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
      <SectionHeader className="compact dashboard-current-day-stock-heading" title={showingUpcoming && !todayRows.length ? "Upcoming Pressure Stocks" : "Current Day Stock"} icon="bi-bar-chart-line" />
      <GannTable
        rows={currentDayRows}
        total={currentDayRows.length}
        todayKey={todayKey}
        todayFilter={showingUpcoming && !todayRows.length ? "upcoming" : "today"}
      />
    </div>
  );
}
