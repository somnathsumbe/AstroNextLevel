"use client";

import { useEffect, useState } from "react";
import GannTable from "./GannTable";
import {
  getIndiaTodayKey,
  isTodayPressureDate,
  normalizePressureRecords,
} from "./GannUtils";

function getStaticDataUrl() {
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/AstroNextLevel")) {
    return "/AstroNextLevel/data/gann-pressure-dates.json";
  }
  return "/data/gann-pressure-dates.json";
}

export default function CurrentDayStock() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const todayKey = getIndiaTodayKey();

  useEffect(() => {
    fetch("/api/stocks/today?all=1")
      .then((response) => {
        if (!response.ok) return fetch(getStaticDataUrl());
        return response.json();
      })
      .then((payload) => {
        if (!payload.ok && payload.status) throw new Error("Unable to load pressure date data.");
        return payload.json ? payload.json() : payload;
      })
      .then((payload) => setData(normalizePressureRecords(payload.data || payload || [])))
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const currentDayRows = data.filter((item) =>
    isTodayPressureDate(item.PressureDate || item.pressureDate, todayKey),
  );

  if (loading) {
    return (
      <section className="data-panel dashboard-current-day-stock">
        <div className="state-panel gann-loading">
          <i className="bi bi-arrow-repeat" />
          <strong>Loading current day stocks...</strong>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="data-panel dashboard-current-day-stock">
        <div className="calculator-error" role="alert">
          <i className="bi bi-exclamation-circle" /> {error}
        </div>
      </section>
    );
  }

  return (
    <div className="dashboard-current-day-stock">
      <div className="astro-section-heading compact dashboard-current-day-stock-heading">
        <h2><i className="bi bi-bar-chart-line" /> Current Day Stock</h2>
      </div>
      <GannTable
        rows={currentDayRows}
        total={currentDayRows.length}
        todayKey={todayKey}
        todayFilter="today"
      />
    </div>
  );
}
