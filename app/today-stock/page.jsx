"use client";

import { useEffect, useMemo, useState } from "react";
import GannFilters from "@/components/gann/GannFilters";
import GannHeader from "@/components/gann/GannHeader";
import GannSummary from "@/components/gann/GannSummary";
import GannTable from "@/components/gann/GannTable";
import {
  getIndiaTodayKey,
  isTodayPressureDate,
  normalizePressureRecords,
  pressureDateKey,
} from "@/components/gann/GannUtils";
import amavasyaData from "@/data/amavasya.json";
import purnimaData from "@/data/purnima.json";
import { parsePurnimaDate } from "@/lib/purnima-utils";

const initialFilters = {
  stock: "all",
  planet: "all",
  sector: "all",
  dateOffset: 0,
  priority: "all",
  search: "",
};

function getDataUrl() {
  if (typeof window === "undefined") return "/data/gann-pressure-dates.json";
  const isGithubPages = window.location.pathname.includes("/AstroNextLevel");
  return isGithubPages
    ? "/AstroNextLevel/data/gann-pressure-dates.json"
    : "/data/gann-pressure-dates.json";
}

function dateKeyFromValue(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return "";
  const date = new Date(year, month - 1, day);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function relativeDateKey(baseKey, offsetDays) {
  const baseDate = new Date(`${baseKey}T00:00:00+05:30`);
  baseDate.setDate(baseDate.getDate() + offsetDays);
  return dateKeyFromValue(
    `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, "0")}-${String(baseDate.getDate()).padStart(2, "0")}`,
  );
}

function formatLunarDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getRecentLunarDates() {
  const today = new Date(`${getIndiaTodayKey()}T23:59:59+05:30`);
  const amavasya = (amavasyaData.years || [])
    .flatMap((yearData) =>
      (yearData.entries || []).map((entry) => ({
        date: new Date(String(entry.start).replace(" ", "T")),
        festival: Array.isArray(entry.festival)
          ? entry.festival.join(", ")
          : entry.festival,
      })),
    )
    .filter((entry) => entry.date <= today)
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);
  const purnima = Object.entries(purnimaData.years || {})
    .flatMap(([year, entries]) =>
      entries.map((entry) => ({
        date: parsePurnimaDate(entry.date),
        name: entry.name,
        year,
      })),
    )
    .filter((entry) => entry.date <= today)
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);

  return {
    amavasya: amavasya.map((entry) => ({
      ...entry,
      label: formatLunarDate(entry.date),
    })),
    purnima: purnima.map((entry) => ({
      ...entry,
      label: formatLunarDate(entry.date),
    })),
  };
}

export default function TodayStockPage() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [showLunarDates, setShowLunarDates] = useState(false);
  const [copiedDate, setCopiedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const todayKey = getIndiaTodayKey();
  const selectedDateKey =
    filters.dateOffset === "all"
      ? "all"
      : relativeDateKey(todayKey, filters.dateOffset);
  const [lunarDates, setLunarDates] = useState(getRecentLunarDates);

  useEffect(() => {
    const dataUrl = getDataUrl();

    fetch(dataUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load pressure date data.");
        return response.json();
      })
      .then((records) => setData(normalizePressureRecords(records)))
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const options = useMemo(
    () => ({
      stocks: [...new Set(data.map((item) => item.stock).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b),
      ),
      planets: [
        ...new Set(data.map((item) => item.planet).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b)),
      sectors: [...new Set(data.map((item) => item.sector).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b),
      ),
      priorities: [
        ...new Set(data.map((item) => item.priority).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b)),
    }),
    [data],
  );

  const icons = useMemo(
    () =>
      data.reduce((result, item) => {
        if (
          item.planet &&
          item.planetIcon &&
          !String(item.planetIcon).includes("ð")
        )
          result[item.planet] = item.planetIcon;
        return result;
      }, {}),
    [data],
  );

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        const pressureDateValue = item.PressureDate || item.pressureDate || "";
        const itemDateKey = pressureDateKey(pressureDateValue);
        const matchesDateFilter =
          selectedDateKey === "all" ||
          (itemDateKey && itemDateKey === selectedDateKey);

        return (
          (filters.stock === "all" || item.stock === filters.stock) &&
          (filters.planet === "all" || item.planet === filters.planet) &&
          (filters.sector === "all" || item.sector === filters.sector) &&
          matchesDateFilter &&
          (filters.priority === "all" ||
            String(item.priority).toLowerCase() ===
              String(filters.priority).toLowerCase()) &&
          (!filters.search ||
            String(item.stock || "")
              .toLowerCase()
              .includes(filters.search.trim().toLowerCase()))
        );
      }),
    [data, filters, selectedDateKey],
  );

  const summary = useMemo(
    () => ({
      stocks: options.stocks.length,
      records: data.length,
      high: data.filter(
        (item) => String(item.priority).toLowerCase() === "high",
      ).length,
      today: data.filter((item) =>
        isTodayPressureDate(item.PressureDate, todayKey),
      ).length,
    }),
    [data, options.stocks.length, todayKey],
  );

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function toggleLunarDates() {
    setLunarDates(getRecentLunarDates());
    setShowLunarDates((current) => !current);
  }

  async function copyLunarDate(dateKey) {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(dateKey);
    setCopiedDate(dateKey);
  }

  return (
    <main className="container-fluid tool-page today-stock-page">
      <GannHeader />
      <GannSummary summary={summary} />
      <GannFilters
        values={filters}
        options={options}
        icons={icons}
        dateLabel={selectedDateKey}
        onChange={updateFilter}
        onReset={() => setFilters(initialFilters)}
      />
      <section
        className="lunar-dates-panel"
        aria-labelledby="lunar-dates-title"
      >
        <div className="lunar-dates-heading">
          <div>
            <span className="eyebrow">LUNAR CYCLE / RECENT HISTORY</span>
            <h2 id="lunar-dates-title">Last 5 Amavasya &amp; Purnima</h2>
          </div>
          <button
            className="outline-action"
            type="button"
            onClick={toggleLunarDates}
            aria-expanded={showLunarDates}
            aria-controls="lunar-dates-table"
          >
            <i className={`bi bi-chevron-${showLunarDates ? "up" : "down"}`} />{" "}
            {showLunarDates ? "Hide Dates" : "Show Dates"}
          </button>
        </div>
        {showLunarDates && (
          <div id="lunar-dates-table" className="lunar-dates-table-wrap">
            <table className="lunar-dates-table">
              <tbody>
                <tr>
                  <th scope="row">
                    <i className="bi bi-moon" /> Amavasya
                  </th>
                  {lunarDates.amavasya.map((entry) => (
                    <td
                      className={copiedDate === entry.label ? "is-copied" : ""}
                      key={entry.date.toISOString()}
                      title={entry.festival || "Amavasya"}
                    >
                      <span>{entry.label}</span>
                      <button
                        type="button"
                        className="lunar-copy-button"
                        onClick={() => copyLunarDate(entry.label)}
                        aria-label={`Copy Amavasya date ${entry.label}`}
                        title={`Copy ${entry.label}`}
                      >
                        <i
                          className={`bi bi-${copiedDate === entry.label ? "check2" : "clipboard"}`}
                        />
                      </button>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">
                    <i className="bi bi-moon-stars" /> Purnima
                  </th>
                  {lunarDates.purnima.map((entry) => (
                    <td
                      className={copiedDate === entry.label ? "is-copied" : ""}
                      key={`${entry.date.toISOString()}-${entry.name}`}
                      title={entry.name}
                    >
                      <span>{entry.label}</span>
                      <button
                        type="button"
                        className="lunar-copy-button"
                        onClick={() => copyLunarDate(entry.label)}
                        aria-label={`Copy Purnima date ${entry.label}`}
                        title={`Copy ${entry.label}`}
                      >
                        <i
                          className={`bi bi-${copiedDate === entry.label ? "check2" : "clipboard"}`}
                        />
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
      {loading && (
        <div className="state-panel gann-loading">
          <i className="bi bi-arrow-repeat" />
          <strong>Loading pressure dates...</strong>
        </div>
      )}
      {error && (
        <div className="calculator-error" role="alert">
          <i className="bi bi-exclamation-circle" /> {error}
        </div>
      )}
      {!loading && !error && (
        <GannTable
          rows={filteredData}
          total={data.length}
          todayKey={todayKey}
          todayFilter={filters.dateOffset === 0 ? "today" : ""}
        />
      )}
    </main>
  );
}
