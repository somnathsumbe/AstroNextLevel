'use client';

import { useEffect, useState } from 'react';
import SectionHeader from '@/components/common/SectionHeader';

export default function DashboardLunarSections({ lunar, currentMonthKey, nextMonthKey }) {
  const [copiedDate, setCopiedDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (!copiedDate) return undefined;
    const timeoutId = window.setTimeout(() => setCopiedDate(null), 1400);
    return () => window.clearTimeout(timeoutId);
  }, [copiedDate]);

  async function copyDate(dateKey) {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(dateKey);
    setCopiedDate(dateKey);
  }

  function renderLunarSection({ title, dates, selectedDate, onSelect }) {
    const titleId = `dashboard-${title.toLowerCase()}-title`;
    return <section className="dashboard-lunar-section" aria-labelledby={titleId}>
      <SectionHeader title={title} icon="bi-moon-stars" titleId={titleId} />
      <div className="dashboard-lunar-grid row g-2">
        {dates.map((dateKey) => {
          const isSelected = selectedDate === dateKey;
          const isCurrentMonth = currentMonthKey && dateKey.slice(0, 7) === currentMonthKey;
          const isNextMonth = nextMonthKey && dateKey.slice(0, 7) === nextMonthKey;
          const selectAndCopy = () => {
            onSelect(dateKey);
            copyDate(dateKey);
          };
          return <div key={`${title}-${dateKey}`} className={`dashboard-lunar-card col-12 col-sm-6 col-md-4 col-lg-1 ${isSelected ? 'is-selected' : ''}`} aria-pressed={isSelected} role="button" tabIndex="0" onClick={selectAndCopy} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectAndCopy(); } }}>
            <button type="button" className="dashboard-lunar-date-button" onClick={(event) => { event.stopPropagation(); selectAndCopy(); }} aria-label={`Select and copy ${dateKey}`}><span className="dashboard-lunar-date">{dateKey}</span></button>
            <div className="dashboard-lunar-meta">
              <button type="button" className="dashboard-lunar-copy-button" onClick={(event) => { event.stopPropagation(); copyDate(dateKey); }} aria-label={`Copy ${dateKey}`} title={copiedDate === dateKey ? `Copied ${dateKey}` : `Copy ${dateKey}`}><i className={`bi bi-${copiedDate === dateKey ? 'check2' : 'clipboard'}`} /></button>
              {isCurrentMonth && <span className="dashboard-lunar-status">Current</span>}
              {isNextMonth && !isCurrentMonth && <span className="dashboard-lunar-status">Next</span>}
              {isSelected && <span className="dashboard-lunar-status selected">Selected</span>}
            </div>
          </div>;
        })}
      </div>
    </section>;
  }

  return <div className="dashboard-lunar-wrap">
    {renderLunarSection({ title: 'Amavasya', dates: lunar.amavasya.recent, selectedDate, onSelect: setSelectedDate })}
    {renderLunarSection({ title: 'Purnima', dates: lunar.purnima.recent, selectedDate, onSelect: setSelectedDate })}
  </div>;
}