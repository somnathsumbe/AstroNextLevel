"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ANGLES,
  IMPORTANT_ANGLES,
  readStockData,
  saveStockData,
  STOCK_DATA,
  STOCK_DATA_VERSION,
  normalizeStockData,
} from "./stockMaster";

const DEFAULT_TIME = "09:15";
const DAY_MS = 86400000;

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(value);
}
function dayName(value) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    timeZone: "Asia/Kolkata",
  }).format(value);
}
function displayReferenceDate(value) {
  const [year, month, day] = (value || "").split("-");
  return year && month && day ? `${day}-${month}-${year}` : value || "—";
}
function inputDate(value) {
  const parts = (value || "").split("-");
  return parts[0]?.length === 2
    ? `${parts[2]}-${parts[1]}-${parts[0]}`
    : value || "";
}
function referenceFor(stock, type) {
  const low = type === "Major Low";
  return {
    date: low ? stock?.referenceDateLow : stock?.referenceDateHigh,
    value: low ? stock?.low : stock?.high,
  };
}
function parseBase(date, time) {
  if (!date || date === "VERIFY_REQUIRED") return null;
  const rawParts = date.split("-").map(Number);
  const [year, month, day] =
    rawParts[0] > 31 ? rawParts : [rawParts[2], rawParts[1], rawParts[0]];
  const [hour, minute] = (time || DEFAULT_TIME).split(":").map(Number);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;
  return new Date(
    Date.UTC(year, month - 1, day, hour || 0, minute || 0) - 19800000,
  );
}
function calculatePressureDates(
  stock,
  referenceDate,
  referenceTime,
  referenceType,
  timeframe,
  windowDays,
) {
  const base = parseBase(referenceDate, referenceTime);
  if (!base) return [];
  return ANGLES.map((angle) => {
    const days = (angle / 360) * 365.25;
    const pressureDate = new Date(base.getTime() + days * DAY_MS);
    return {
      id: `${stock.stock}-${angle}`,
      angle,
      pressureDate,
      priority: IMPORTANT_ANGLES.has(angle) ? "IMPORTANT" : "SECONDARY",
      window: `${windowDays} Day${windowDays === 1 ? "" : "s"}`,
      indiaTime: referenceTime || DEFAULT_TIME,
      stock: stock.stock,
      sector: stock.sector,
      referenceDate,
      referenceType,
      timeframe,
    };
  });
}
function downloadJson(stocks) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([JSON.stringify(stocks, null, 2)], { type: "application/json" }),
  );
  link.download = "gann-stock-data.json";
  link.click();
  URL.revokeObjectURL(link.href);
}
function exportExcel(rows) {
  const headers = [
    "#",
    "Pressure Date",
    "Day",
    "Priority",
    "Window",
    "Angle",
    "India Time",
    "Stock",
    "Sector",
    "Reference Date",
    "Reference Type",
  ];
  const body = rows.map((row, index) => [
    index + 1,
    formatDate(row.pressureDate),
    dayName(row.pressureDate),
    row.priority,
    row.window,
    `${row.angle}°`,
    row.indiaTime,
    row.stock,
    row.sector,
    row.referenceDate,
    row.referenceType,
  ]);
  const escape = (value) =>
    String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;");
  const table = `<table><thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${body.map((line) => `<tr>${line.map((cell) => `<td>${escape(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([`<html><meta charset="utf-8"><body>${table}</body></html>`], {
      type: "application/vnd.ms-excel",
    }),
  );
  link.download = "gann-stocks-times.xls";
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function StocksTimesPage() {
  const [stocks, setStocks] = useState(() => normalizeStockData(STOCK_DATA));
  const [stockSymbol, setStockSymbol] = useState("360ONE");
  const [search, setSearch] = useState("");
  const [referenceDate, setReferenceDate] = useState("2026-01-16");
  const [referenceTime, setReferenceTime] = useState(DEFAULT_TIME);
  const [referenceType, setReferenceType] = useState("Major High");
  const [timeframe, setTimeframe] = useState("15 Min");
  const [windowDays, setWindowDays] = useState(1);
  const [priority, setPriority] = useState("All");
  const [results, setResults] = useState([]);
  const [showAddStock, setShowAddStock] = useState(false);
  const [newStock, setNewStock] = useState({
    stock: "",
    sector: "",
    d_0: "",
    high: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const currentVersion = window.localStorage.getItem(
      "gann_stock_data_version",
    );
    if (currentVersion !== STOCK_DATA_VERSION) {
      saveStockData(normalizeStockData(STOCK_DATA));
      window.localStorage.setItem(
        "gann_stock_data_version",
        STOCK_DATA_VERSION,
      );
    }
    const saved =
      currentVersion === STOCK_DATA_VERSION ? readStockData() : normalizeStockData(STOCK_DATA);
    setStocks(saved);
    const last = window.localStorage.getItem(
      "gann_stocks_times_last_selection",
    );
    const initialStock =
      saved.find((stock) => stock.stock === last) || saved[0];
    if (initialStock) {
      setStockSymbol(initialStock.stock);
      setReferenceDate(
        inputDate(referenceFor(initialStock, "Major High").date),
      );
    }
  }, []);
  const selectedStock =
    stocks.find((stock) => stock.stock === stockSymbol) || stocks[0];
  const activeReference = referenceFor(selectedStock, referenceType);
  const filteredStocks = useMemo(
    () =>
      stocks.filter((stock) =>
        stock.stock.toLowerCase().includes(search.toLowerCase()),
      ),
    [stocks, search],
  );
  const visibleResults = useMemo(
    () =>
      priority === "All"
        ? results
        : results.filter((row) => row.priority === priority),
    [results, priority],
  );
  const groupedResults = useMemo(
    () =>
      visibleResults.reduce((groups, row) => {
        (groups[row.sector] ||= []).push(row);
        return groups;
      }, {}),
    [visibleResults],
  );

  function chooseStock(symbol) {
    const stock = stocks.find((entry) => entry.stock === symbol);
    if (!stock) return;
    setStockSymbol(symbol);
    setReferenceDate(inputDate(referenceFor(stock, referenceType).date));
    window.localStorage.setItem("gann_stocks_times_last_selection", symbol);
  }
  function changeReferenceType(type) {
    setReferenceType(type);
    setReferenceDate(inputDate(referenceFor(selectedStock, type).date));
  }
  function calculate() {
    setError("");
    if (!referenceDate || !referenceTime) {
      setError("Reference Date and Reference Time are required.");
      return;
    }
    if (!parseBase(referenceDate, referenceTime)) {
      setError("This reference date requires verification before calculation.");
      return;
    }
    setCalculating(true);
    window.setTimeout(() => {
      setResults(
        calculatePressureDates(
          selectedStock,
          referenceDate,
          referenceTime,
          referenceType,
          timeframe,
          windowDays,
        ),
      );
      setPriority("All");
      setCalculating(false);
    }, 180);
  }
  function reset() {
    chooseStock("360ONE");
    setReferenceTime(DEFAULT_TIME);
    setReferenceType("Major High");
    setTimeframe("15 Min");
    setWindowDays(1);
    setResults([]);
    setPriority("All");
    setError("");
  }
  function addStock(event) {
    event.preventDefault();
    const symbol = newStock.stock.trim().toUpperCase();
    if (
      !symbol ||
      !newStock.sector.trim() ||
      !newStock.d_0 ||
      newStock.high === "" ||
      Number.isNaN(Number(newStock.high))
    ) {
      setError("Stock, Sector, Reference Date and numeric High are required.");
      return;
    }
    if (stocks.some((stock) => stock.stock === symbol)) {
      setError("Stock already exists.");
      return;
    }
    const next = [
      ...stocks,
      {
        stock: symbol,
        sector: newStock.sector.trim(),
        referenceDateHigh: newStock.d_0,
        high: Number(newStock.high),
        referenceTypeHigh: "Major High",
        referenceDateLow: "VERIFY_REQUIRED",
        low: null,
        referenceTypeLow: "Major Low",
      },
    ].sort((a, b) => a.stock.localeCompare(b.stock));
    setStocks(next);
    saveStockData(next);
    setShowAddStock(false);
    setNewStock({ stock: "", sector: "", d_0: "", high: "" });
    setMessage("Stock added successfully");
    setError("");
  }
  return (
    <main className="container-fluid tool-page stocks-times-page">
      <header className="page-heading-row">
        <div>
          <div className="eyebrow">MARKET TIMING MODULE</div>
          <h1 className="page-title">📊 Stocks Times</h1>
          <p className="page-subtitle">
            Stock-wise market timing and Gann pressure analysis
          </p>
          <nav className="breadcrumb-line" aria-label="Breadcrumb">
            <i className="bi bi-house" />{" "}
            <Link href="/dashboard">Dashboard</Link>
            <span>/</span>Stocks Times
          </nav>
        </div>
        <div className="page-actions">
          <button
            className="outline-action"
            type="button"
            onClick={() => downloadJson(stocks)}
          >
            <i className="bi bi-download" /> Download JSON
          </button>
          <button
            className="outline-action"
            type="button"
            onClick={() => exportExcel(visibleResults)}
            disabled={!visibleResults.length}
          >
            <i className="bi bi-file-earmark-spreadsheet" /> Export Excel
          </button>
          <button
            className="gold-action"
            type="button"
            onClick={() => setShowAddStock(true)}
          >
            <i className="bi bi-plus-lg" /> Add Stock
          </button>
        </div>
      </header>
      {message && (
        <div className="degree-toast stocks-toast" role="status">
          <i className="bi bi-check-circle" />
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Dismiss"
          >
            <i className="bi bi-x" />
          </button>
        </div>
      )}
      <form
        className="filter-panel stock-times-form"
        onSubmit={(event) => {
          event.preventDefault();
          calculate();
        }}
      >
        <div className="filter-title">
          <span>
            <i className="bi bi-calculator" /> Stock-wise market timing analysis
          </span>
          <span className="location-note">Mumbai, India - IST (+05:30)</span>
        </div>
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-6 col-xl-3">
            <label htmlFor="stock-search">Search Stock</label>
            <input
              id="stock-search"
              className="form-control"
              placeholder="Search symbol..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="form-select mt-2"
              value={stockSymbol}
              onChange={(event) => chooseStock(event.target.value)}
              aria-label="Stock Name"
            >
              {filteredStocks.map((stock) => (
                <option key={stock.stock} value={stock.stock}>
                  {stock.stock}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <label htmlFor="sector">Sector</label>
            <input
              id="sector"
              className="form-control"
              value={selectedStock?.sector || ""}
              readOnly
            />
          </div>
          <div className="col-12 col-md-4 col-xl-2">
            <label htmlFor="reference-date-times">Reference Date</label>
            <input
              id="reference-date-times"
              className="form-control"
              type="date"
              value={referenceDate}
              onChange={(event) => setReferenceDate(event.target.value)}
              required
            />
          </div>
          <div className="col-6 col-md-4 col-xl-2">
            <label htmlFor="reference-time-times">Reference Time</label>
            <input
              id="reference-time-times"
              className="form-control"
              type="time"
              value={referenceTime}
              onChange={(event) => setReferenceTime(event.target.value)}
              required
            />
          </div>
          <div className="col-6 col-md-4 col-xl-2">
            <label htmlFor="high">Reference Value</label>
            <input
              id="high"
              className="form-control"
              value={activeReference.value ?? ""}
              readOnly
            />
          </div>
          <div className="col-12 col-md-4">
            <label htmlFor="reference-type-times">Reference Type</label>
            <select
              id="reference-type-times"
              className="form-select"
              value={referenceType}
              onChange={(event) => changeReferenceType(event.target.value)}
            >
              <option>Major High</option>
              <option>Major Low</option>
            </select>
          </div>
          <div className="col-6 col-md-4">
            <label htmlFor="timeframe-times">Timeframe</label>
            <select
              id="timeframe-times"
              className="form-select"
              value={timeframe}
              onChange={(event) => setTimeframe(event.target.value)}
            >
              <option>15 Min</option>
              <option>4 Hour</option>
              <option>1 Day</option>
            </select>
          </div>
          <div className="col-6 col-md-4">
            <label htmlFor="window-times">Tentative Window</label>
            <select
              id="window-times"
              className="form-select"
              value={windowDays}
              onChange={(event) => setWindowDays(Number(event.target.value))}
            >
              <option value="1">1 Day</option>
              <option value="2">2 Days</option>
            </select>
          </div>
        </div>
        {error && (
          <div className="calculator-error" role="alert">
            <i className="bi bi-exclamation-circle" /> {error}
          </div>
        )}
        <div className="filter-actions">
          <button className="subtle-action" type="button" onClick={reset}>
            Reset
          </button>
          <button className="gold-action" type="submit" disabled={calculating}>
            {calculating ? "Calculating..." : "Calculate"}
          </button>
        </div>
      </form>
      {results.length === 0 ? (
        <section className="data-panel empty-stocks-state">
          <i className="bi bi-calendar-x" />
          <strong>No pressure dates available.</strong>
          <span>Select a stock and calculate.</span>
        </section>
      ) : (
        <section className="data-panel stocks-results">
          <div className="data-panel-heading">
            <div>
              <span className="eyebrow">GANN PRESSURE ANALYSIS</span>
              <h2>📅 Probable Gann Pressure Dates</h2>
            </div>
            <div
              className="priority-buttons"
              role="group"
              aria-label="Priority filter"
            >
              {["All", "IMPORTANT", "SECONDARY"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={priority === item ? "current-page" : ""}
                  onClick={() => setPriority(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          {Object.entries(groupedResults).map(([sector, rows]) => (
            <div className="sector-result-group" key={sector}>
              <div className="table-responsive">
                <table className="analysis-table stocks-pressure-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Pressure Date</th>
                      <th>Day</th>
                      <th>Priority</th>
                      <th>Window</th>
                      <th>Angle</th>
                      <th>India Time</th>
                      <th>Stock</th>
                      <th>Sector</th>
                      <th>Reference Date</th>
                      <th>Reference Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr
                        className={
                          row.priority === "IMPORTANT"
                            ? "important-result"
                            : "secondary-result"
                        }
                        key={row.id}
                      >
                        <td>{index + 1}</td>
                        <td>
                          <strong>{formatDate(row.pressureDate)}</strong>
                        </td>
                        <td>{dayName(row.pressureDate)}</td>
                        <td>
                          <span
                            className={`status-badge priority-${row.priority.toLowerCase()}`}
                          >
                            {row.priority}
                          </span>
                        </td>
                        <td>{row.window}</td>
                        <td>{row.angle}°</td>
                        <td>{row.indiaTime}</td>
                        <td>{row.stock}</td>
                        <td>{row.sector}</td>
                        <td>{displayReferenceDate(row.referenceDate)}</td>
                        <td>{row.referenceType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      )}
      {showAddStock && (
        <div
          className="modal-backdrop-custom"
          role="presentation"
          onClick={() => setShowAddStock(false)}
        >
          <div
            className="detail-modal stocks-add-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-stock-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-top">
              <div>
                <span className="eyebrow">STOCK MASTER</span>
                <h2 id="add-stock-title">Add Stock</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStock(false)}
                aria-label="Close"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <form onSubmit={addStock}>
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="new-stock">Stock Name *</label>
                  <input
                    id="new-stock"
                    className="form-control"
                    value={newStock.stock}
                    onChange={(event) =>
                      setNewStock({ ...newStock, stock: event.target.value })
                    }
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="new-sector">Sector *</label>
                  <input
                    id="new-sector"
                    className="form-control"
                    value={newStock.sector}
                    onChange={(event) =>
                      setNewStock({ ...newStock, sector: event.target.value })
                    }
                  />
                </div>
                <div className="col-6">
                  <label htmlFor="new-date">Reference Date *</label>
                  <input
                    id="new-date"
                    className="form-control"
                    type="date"
                    value={newStock.d_0}
                    onChange={(event) =>
                      setNewStock({ ...newStock, d_0: event.target.value })
                    }
                  />
                </div>
                <div className="col-6">
                  <label htmlFor="new-high">High *</label>
                  <input
                    id="new-high"
                    className="form-control"
                    type="number"
                    step="any"
                    value={newStock.high}
                    onChange={(event) =>
                      setNewStock({ ...newStock, high: event.target.value })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer-actions">
                <button
                  className="subtle-action"
                  type="button"
                  onClick={() => setShowAddStock(false)}
                >
                  Cancel
                </button>
                <button className="gold-action" type="submit">
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
