import { useState } from 'react';
import { formatDisplayDate, formatNumber, isTodayPressureDate, planetIcon } from './GannUtils';

function copyToClipboard(value) {
  const text = String(value ?? '').trim();
  if (!text || typeof navigator === 'undefined' || !navigator.clipboard || !navigator.clipboard.writeText) {
    return;
  }

  navigator.clipboard.writeText(text);
}

export default function GannTable({ rows, total, todayKey, todayFilter, onConfigureTrade, tradeByStock, onToggleNotification }) {
  const [copiedHighDate, setCopiedHighDate] = useState('');

  async function copyHighDate(stock, date) {
    const value = formatDisplayDate(date);
    if (!value || typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return;

    await navigator.clipboard.writeText(value);
    setCopiedHighDate(`${stock}-${value}`);
    window.setTimeout(() => setCopiedHighDate(''), 1600);
  }

  return (
    <section className="data-panel gann-today-data">
      <div className="data-panel-heading">
        <div>
          <span className="eyebrow">PRESSURE DATE REGISTER</span>
          <h2>Showing {rows.length.toLocaleString('en-IN')} of {total.toLocaleString('en-IN')} Pressure Dates</h2>
        </div>
        {todayFilter === 'today' && (
          <div className="gann-result-note">
            <i className="bi bi-check-circle" /> Today&apos;s Pressure Stocks: {new Set(rows.map((row) => row.stock || row.Stock)).size}
          </div>
        )}
        {todayFilter === 'upcoming' && (
          <div className="gann-result-note">
            <i className="bi bi-calendar-event" /> Next available pressure date
          </div>
        )}
      </div>

      {rows.length === 0 && !onConfigureTrade ? (
        <div className="state-panel">
          <i className="bi bi-search" />
          <strong>No pressure dates match these filters.</strong>
          <span>Try resetting one or more filters.</span>
        </div>
      ) : rows.length === 0 ? (
        <div className="state-panel">
          <i className="bi bi-database-exclamation" />
          <strong>No stock records are available yet.</strong>
          <span>Load stock pressure data before creating a trade notification.</span>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table analysis-table gann-today-table">
            <caption className="visually-hidden">Gann pressure date records</caption>
            <thead>
              <tr>
                <th>#</th>
                <th>Stock</th>
                {onConfigureTrade && <th>Notification</th>}
                <th>Pressure Date</th>
                <th>Angle</th>
                <th>Day</th>
                <th>Priority</th>
                <th>Reference</th>
                <th>High</th>
                <th>High Date</th>
                <th>Low Date</th>
                <th>Low</th>
                <th>Movement</th>
                <th>Planet + Icon</th>
                <th>Sector</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const today = isTodayPressureDate(row.PressureDate || row.pressureDate, todayKey);
                const stockValue = row.stock || row.Stock || '';
                const pressureDateValue = row.PressureDate || row.pressureDate || '';
                const angleValue = row.angle ?? row.Angle ?? '';
                const dayValue = row.Day || row.day || '';
                const priorityValue = row.priority || row.Priority || 'Secondary';
                const referenceTypeValue = row.referenceTypeHigh || row.ReferenceType || row.referenceType || '';
                const highValue = row.high ?? row.High ?? row.ReferenceValue ?? '';
                const referenceDateHighValue = row.referenceDateHigh || row.ReferenceDate || row.referenceDate || '';
                const lowDateValue = row.referenceDateLow || row.LowDate || row.lowDate || row.referenceLowDate || '';
                const lowValue = row.low ?? row.Low ?? '';
                const sectorValue = row.sector || row.Sector || '';
                const planetValue = row.planet || row.Planet || '';
                const planetIconValue = row.planetIcon || row.PlanetIcon || '';
                const movementValue = row.normalDailyMovement || row.Movement || '';

                return (
                  <tr className={today ? 'table-success' : ''} key={`${stockValue}-${pressureDateValue}-${angleValue}-${index}`}>
                    <td data-label="#">{index + 1}</td>
                    <td data-label="Stock">
                      <div className="d-flex align-items-center gap-2">
                        <strong className="stock-copy-label">{stockValue}</strong>
                        <button
                          type="button"
                          className="btn btn-link btn-sm px-1 py-0 text-muted stock-copy-btn"
                          title={`Copy ${stockValue}`}
                          onClick={() => copyToClipboard(stockValue)}
                          aria-label={`Copy ${stockValue}`}
                        >
                          <i className="bi bi-clipboard" />
                        </button>
                      </div>
                    </td>
                    {onConfigureTrade && (
                      <td data-label="Notification">
                        <div className="form-check form-switch trade-notification-switch">
                          <input className="form-check-input" type="checkbox" id={`notification-${stockValue}-${index}`} checked={Boolean(tradeByStock?.[stockValue]?.notification?.enabled)} onChange={(event) => onToggleNotification ? onToggleNotification(row, event.target.checked) : event.target.checked && onConfigureTrade(row)} aria-label={`Enable notifications for ${stockValue}`} />
                          <label className="form-check-label" htmlFor={`notification-${stockValue}-${index}`}>{tradeByStock?.[stockValue]?.notification?.enabled ? 'ON' : 'OFF'}</label>
                        </div>
                      </td>
                    )}
                    <td data-label="Pressure Date">
                      <strong>{pressureDateValue}</strong>
                      {today && <span className="badge bg-success ms-1">TODAY</span>}
                    </td>
                    <td data-label="Angle"><span className="degree-badge">{angleValue}°</span></td>
                    <td data-label="Day">{dayValue}</td>
                    <td data-label="Priority">
                      <span className={`badge ${priorityValue === 'High' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                        {priorityValue}
                      </span>
                    </td>
                    <td data-label="Reference">{referenceTypeValue}</td>
                    <td data-label="High">{formatNumber(highValue)}</td>
                    <td data-label="High Date" className={copiedHighDate === `${stockValue}-${formatDisplayDate(referenceDateHighValue)}` ? 'high-date-copied' : ''}>
                      <strong>{formatDisplayDate(referenceDateHighValue)}</strong>
                      <button
                        type="button"
                        className="high-date-copy-btn"
                        title={`Copy high date ${formatDisplayDate(referenceDateHighValue)}`}
                        aria-label={`Copy high date ${formatDisplayDate(referenceDateHighValue)}`}
                        onClick={() => copyHighDate(stockValue, referenceDateHighValue)}
                      >
                        <i className={`bi bi-${copiedHighDate === `${stockValue}-${formatDisplayDate(referenceDateHighValue)}` ? 'check2' : 'clipboard'}`} />
                      </button>
                    </td>
                    <td data-label="Low Date">{formatDisplayDate(lowDateValue)}</td>
                    <td data-label="Low">{formatNumber(lowValue)}</td>
                    <td data-label="Movement"><span className="movement-pill">{movementValue}</span></td>
                    <td data-label="Planet + Icon">
                      <div className="planet-badge-wrap">
                        <span className="planet-name">{planetValue}</span>
                        {planetIconValue && <span className="planet-icon">{planetIconValue}</span>}
                        {!planetIconValue && planetIcon(planetValue) && <span className="planet-icon">{planetIcon(planetValue)}</span>}
                      </div>
                    </td>
                    <td data-label="Sector"><span className="sector-pill">{sectorValue}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
