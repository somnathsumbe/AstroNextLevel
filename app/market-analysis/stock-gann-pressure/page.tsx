"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { stockService } from "@/lib/data/services/stock.service";
import type { GenerateResponse, GannInputStock, GannPressureRecord } from "@/lib/stocks/stock-types";

const SAMPLE: GannInputStock[] = [{ stock: "360ONE", referenceDateHigh: "16-01-2026", high: 1235.65, referenceTypeHigh: "Major High", referenceDateLow: "07-04-2026", low: 906.2, referenceTypeLow: "Major Low", sector: "Financial Services", planet: "Jupiter", planetIcon: "🟡", normalDailyMovement: "30-50 points" }, { stock: "RELIANCE", referenceDateHigh: "10-01-2026", high: 1500, referenceTypeHigh: "Major High", referenceDateLow: "15-03-2026", low: 1300, referenceTypeLow: "Major Low", sector: "Oil & Gas", planet: "Saturn", planetIcon: "🪐", normalDailyMovement: "30-60 points" }];

export default function StockGannPressurePage() {
  const [input, setInput] = useState(JSON.stringify(SAMPLE, null, 2));
  const [referenceType, setReferenceType] = useState("Major High");
  const [referenceTime, setReferenceTime] = useState("09:15");
  const [priority, setPriority] = useState("ALL");
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<GannPressureRecord[]>([]);
  const [summary, setSummary] = useState<GenerateResponse["summary"]>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function clear() { setInput(""); setRecords([]); setSummary(undefined); setMessage(""); setError(""); }
  function loadSample() { setInput(JSON.stringify(SAMPLE, null, 2)); setError(""); }
  async function readFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setInput(await file.text());
  }
  function parseInput(): GannInputStock[] {
    const parsed: unknown = JSON.parse(input);
    if (!Array.isArray(parsed) || !parsed.length) throw new Error("JSON root must be a non-empty array.");
    return parsed as GannInputStock[];
  }
  function validate() {
    try { const stocks = parseInput(); setMessage(`${stocks.length} stock${stocks.length === 1 ? "" : "s"} ready for processing.`); setError(""); }
    catch (validationError) { setMessage(""); setError(validationError instanceof Error ? validationError.message : "Invalid JSON."); }
  }
  async function generate() {
    setBusy(true); setMessage(""); setError("");
    try {
      const payload = await stockService.generateStockRecords({ stocks: parseInput(), referenceType, referenceTime }) as GenerateResponse;
      setRecords(payload.data || []); setSummary(payload.summary); setMessage(`Successfully processed ${payload.summary?.validStocks || 0} stocks.`);
      if (payload.errors?.length) setError(payload.errors.map((item) => `${item.stock || "Stock"}: ${item.message}`).join(" "));
    } catch (generationError) { setError(generationError instanceof Error ? generationError.message : "Unable to process JSON."); }
    finally { setBusy(false); }
  }
  function copyJson() { navigator.clipboard?.writeText(JSON.stringify(records, null, 2)); setMessage("Generated JSON copied."); }
  function downloadJson() { const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([JSON.stringify(records, null, 2)], { type: "application/json" })); link.download = "gann-pressure-dates.json"; link.click(); URL.revokeObjectURL(link.href); }
  const visibleRecords = records.filter((record) => (priority === "ALL" || record.Priority === priority) && (!search || record.Stock.toLowerCase().includes(search.toLowerCase())));
  return (
    <main className="container-fluid tool-page gann-generator-page">
      <header className="page-heading-row"><div><div className="eyebrow">MARKET ANALYSIS / GENERATOR</div><h1 className="page-title">Gann Pressure Date Generator</h1><p className="page-subtitle">Generate, preview and save stock-wise pressure dates</p><nav className="breadcrumb-line" aria-label="Breadcrumb"><i className="bi bi-house" /> <Link href="/dashboard">Dashboard</Link><span>/</span> Gann Generator</nav></div><div className="generator-storage-chip"><i className="bi bi-hdd" /> Server JSON storage</div></header>
      <section className="filter-panel generator-config"><div className="filter-title"><span><i className="bi bi-sliders" /> Calculation Settings</span><span className="location-note">Asia/Kolkata · IST</span></div><div className="row g-3 align-items-end"><div className="col-12 col-md-4"><label htmlFor="generator-reference-type">Reference Type</label><select id="generator-reference-type" className="form-select" value={referenceType} onChange={(event) => setReferenceType(event.target.value)}><option>Major High</option><option>Major Low</option></select></div><div className="col-12 col-md-4"><label htmlFor="generator-reference-time">Reference Time</label><input id="generator-reference-time" className="form-control" type="time" value={referenceTime} onChange={(event) => setReferenceTime(event.target.value)} /></div><div className="col-12 col-md-4"><label htmlFor="generator-search">Preview Search</label><input id="generator-search" className="form-control" placeholder="Search stock..." value={search} onChange={(event) => setSearch(event.target.value)} /></div></div></section>
      <section className="filter-panel generator-input"><div className="filter-title"><span><i className="bi bi-braces" /> Stock Source JSON</span><label className="file-action" htmlFor="generator-file"><i className="bi bi-upload" /> Upload JSON<input id="generator-file" type="file" accept="application/json,.json" onChange={readFile} /></label></div><textarea className="form-control generator-json-box" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Paste one or more stock objects..." /><div className="generator-actions"><button className="subtle-action" type="button" onClick={loadSample}><i className="bi bi-beaker" /> Load Sample</button><button className="subtle-action" type="button" onClick={clear}><i className="bi bi-trash" /> Clear</button><button className="outline-action" type="button" onClick={validate}><i className="bi bi-check2-circle" /> Validate</button><button className="gold-action" type="button" onClick={generate} disabled={busy}><i className="bi bi-cloud-arrow-up" /> {busy ? "Processing..." : "Generate & Save"}</button><button className="subtle-action" type="button" onClick={copyJson} disabled={!records.length}><i className="bi bi-clipboard" /> Copy JSON</button><button className="subtle-action" type="button" onClick={downloadJson} disabled={!records.length}><i className="bi bi-download" /> Download JSON</button></div>{message && <div className="generator-success" role="status"><i className="bi bi-check-circle" /> {message}</div>}{error && <div className="calculator-error" role="alert"><i className="bi bi-exclamation-circle" /> {error}</div>}</section>
      {summary && <section className="row g-3 mb-4 generator-summary">{[[summary.stocksReceived, "Stocks Received"], [summary.newFilesCreated, "New Files"], [summary.existingFilesUpdated, "Updated Files"], [summary.recordsGenerated, "Records Generated"], [summary.highPriority, "HIGH"], [summary.secondary, "SECONDARY"]].map(([value, label]) => <div className="col-6 col-md-4 col-xl-2" key={String(label)}><article className="metric-card"><div className="metric-label">{label}</div><div className="metric-value">{value}</div></article></div>)}</section>}
      <section className="data-panel generator-results"><div className="data-panel-heading"><div><span className="eyebrow">GENERATED PREVIEW</span><h2>{visibleRecords.length.toLocaleString("en-IN")} pressure records</h2></div><select className="form-select generator-priority" value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Priority filter"><option value="ALL">All Priorities</option><option value="HIGH">HIGH</option><option value="SECONDARY">SECONDARY</option></select></div>{visibleRecords.length ? <div className="table-responsive"><table className="table analysis-table generator-table"><thead><tr><th>Stock</th><th>Pressure Date</th><th>Day</th><th>Priority</th><th>Angle</th><th>India Time</th><th>Planet</th><th>Sector</th><th>Reference Value</th><th>Reference Type</th><th>Movement</th></tr></thead><tbody>{visibleRecords.map((record, index) => <tr key={`${record.Stock}-${record.Angle}-${index}`}><td>{record.Stock}</td><td>{record.PressureDate}</td><td>{record.Day}</td><td><span className={`status-badge priority-${record.Priority.toLowerCase()}`}>{record.Priority}</span></td><td>{record.Angle}°</td><td>{record.IndiaTime}</td><td>{record.Planet} {record.PlanetIcon}</td><td>{record.Sector}</td><td>{record.ReferenceValue ?? "—"}</td><td>{record.ReferenceType}</td><td>{record.Movement}</td></tr>)}</tbody></table></div> : <div className="state-panel"><i className="bi bi-table" /><strong>No generated records yet.</strong><span>Paste JSON and choose Generate &amp; Save.</span></div>}</section>
    </main>
  );
}
