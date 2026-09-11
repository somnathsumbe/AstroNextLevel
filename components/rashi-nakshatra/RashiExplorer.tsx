'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Nakshatra, Rashi } from '@/types/astrology';

interface RashiExplorerProps { data: Rashi[]; }
type ViewMode = 'cards' | 'compact';

function findRashi(data: Rashi[], name: string) { return data.find((rashi) => rashi.rashi === name) || data[0]; }
function allNakshatras(data: Rashi[]) { return data.flatMap((rashi) => rashi.nakshatras.map((nakshatra) => ({ ...nakshatra, rashi }))); }
function getSearchTokens(item: Nakshatra & { rashi: Rashi }) {
  return [item.rashi.rashi, item.rashi.rashiMarathi, item.rashi.english, item.name, item.nameMarathi, ...item.padas.flatMap((pada) => [pada.alphabet, pada.transliteration])]
    .flatMap((value) => value.toLowerCase().split(/[\s,()•]+/).filter(Boolean));
}
function matchesExactSearch(item: Nakshatra & { rashi: Rashi }, query: string) {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const searchableTokens = getSearchTokens(item);
  return tokens.length > 0 && tokens.every((token) => searchableTokens.includes(token));
}

function PadaItem({ pada, onCopy }: { pada: { pada: number; alphabet: string; transliteration: string }; onCopy: (value: string) => void }) {
  return <div className="rn-pada-item"><span>Pada {pada.pada}</span><strong>{pada.alphabet}</strong><small>{pada.transliteration}</small><button type="button" onClick={() => onCopy(pada.alphabet)} aria-label={`Copy ${pada.alphabet} ${pada.transliteration}`} title="Copy alphabet"><i className="bi bi-copy" /></button></div>;
}

function NakshatraCard({ item, onCopy, onDetails }: { item: Nakshatra & { rashi: Rashi }; onCopy: (value: string) => void; onDetails: (item: Nakshatra & { rashi: Rashi }) => void }) {
  return <article className="rn-nakshatra-card"><header><div><span className="eyebrow">{item.rashi.symbol} {item.rashi.rashi}</span><h3>{item.nameMarathi}</h3><p>{item.name}</p></div><span className="rn-pada-count">{item.padas.length} Pada</span></header><div className="rn-pada-grid">{item.padas.map((pada) => <PadaItem key={pada.pada} pada={pada} onCopy={onCopy} />)}</div><button className="btn rn-details-button" type="button" onClick={() => onDetails(item)}>View Details <span aria-hidden="true">→</span></button></article>;
}

export default function RashiExplorer({ data }: RashiExplorerProps) {
  const [selectedRashiName, setSelectedRashiName] = useState(data[0]?.rashi || '');
  const [search, setSearch] = useState('');
  const [nakshatraFilter, setNakshatraFilter] = useState('all');
  const [padaFilter, setPadaFilter] = useState('all');
  const [degreeRange, setDegreeRange] = useState('all');
  const [view, setView] = useState<ViewMode>('cards');
  const [details, setDetails] = useState<(Nakshatra & { rashi: Rashi }) | null>(null);
  const [copyMessage, setCopyMessage] = useState('');

  useEffect(() => {
    const storedView = window.localStorage.getItem('rashi-nakshatra-view');
    if (storedView === 'cards' || storedView === 'compact') setView(storedView);
  }, []);
  useEffect(() => { window.localStorage.setItem('rashi-nakshatra-view', view); }, [view]);
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setDetails(null); }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, []);
  useEffect(() => { if (!copyMessage) return undefined; const timer = window.setTimeout(() => setCopyMessage(''), 1800); return () => window.clearTimeout(timer); }, [copyMessage]);

  const selectedRashi = findRashi(data, selectedRashiName);
  const combinedRecords = useMemo(() => allNakshatras(data), [data]);
  const nakshatraOptions = useMemo(() => [...new Map(combinedRecords.map((item) => [item.name, item])).values()].sort((a, b) => a.name.localeCompare(b.name)), [combinedRecords]);
  useEffect(() => {
    const query = search.trim().toLowerCase();
    if (!query) return;
    const match = combinedRecords.find((item) => matchesExactSearch(item, query));
    if (match && match.rashi.rashi !== selectedRashiName) setSelectedRashiName(match.rashi.rashi);
  }, [combinedRecords, search, selectedRashiName]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matchesRange = (rashi: Rashi) => degreeRange === 'all' || `${rashi.startDegree}-${rashi.endDegree}` === degreeRange;
    return combinedRecords.filter((item) => {
      const matchesRashi = item.rashi.rashi === selectedRashiName;
      const matchesNakshatra = nakshatraFilter === 'all' || item.name === nakshatraFilter;
      const matchesSearch = !query || matchesExactSearch(item, query);
      const matchesPada = padaFilter === 'all' || item.padas.some((pada) => pada.pada === Number(padaFilter));
      return matchesRashi && matchesNakshatra && matchesSearch && matchesPada && matchesRange(item.rashi);
    });
  }, [combinedRecords, degreeRange, nakshatraFilter, padaFilter, search, selectedRashiName]);

  const selectRashi = (rashi: Rashi) => { setSelectedRashiName(rashi.rashi); setNakshatraFilter('all'); };
  const reset = () => { setSearch(''); setNakshatraFilter('all'); setPadaFilter('all'); setDegreeRange('all'); setSelectedRashiName(data[0]?.rashi || ''); };
  const copyAlphabet = async (value: string) => { try { await navigator.clipboard.writeText(value); setCopyMessage(`✓ Copied ${value}`); } catch { setCopyMessage('Copy unavailable'); } };
  const selectedPadas = selectedRashi?.nakshatras.reduce((total, item) => total + item.padas.length, 0) || 0;
  const activeCount = [search, nakshatraFilter !== 'all' ? nakshatraFilter : '', padaFilter !== 'all' ? padaFilter : '', degreeRange !== 'all' ? degreeRange : ''].filter(Boolean).length;
  const quickItem = filtered[0] || combinedRecords.find((item) => item.rashi.rashi === selectedRashiName);
  const quickQuery = search.trim().toLowerCase();
  const quickPada = quickItem?.padas.find((pada) => quickQuery && [pada.alphabet, pada.transliteration].some((value) => value.toLowerCase() === quickQuery)) || quickItem?.padas.find((pada) => pada.pada === Number(padaFilter)) || quickItem?.padas[0];

  return <>
    <section className="rn-stats row g-3 mb-4" aria-label="Rashi summary">{[['12', 'Rashi', 'bi-circle'], ['27', 'Nakshatra', 'bi-stars'], ['108', 'Pada', 'bi-grid-3x3-gap'], ['360°', 'Zodiac', 'bi-globe2']].map(([value, label, icon]) => <div className="col-6 col-lg-3" key={label}><article><i className={`bi ${icon}`} /><strong>{value}</strong><span>{label}</span></article></div>)}</section>
    <section className="rn-rashi-selector" aria-label="Rashi selector"><div className="rn-scroll-row">{data.map((rashi) => <button type="button" className={selectedRashiName === rashi.rashi ? 'active' : ''} key={rashi.rashiNo} onClick={() => selectRashi(rashi)}><strong>{rashi.symbol}</strong><span>{rashi.rashiMarathi}</span><small>{rashi.rashi}</small></button>)}</div></section>
    {selectedRashi && <section className="rn-overview" aria-labelledby="rn-overview-title"><div className="rn-overview-title"><span className="rn-large-symbol">{selectedRashi.symbol}</span><div><span className="eyebrow">SELECTED RASHI</span><h2 id="rn-overview-title">{selectedRashi.rashiMarathi}</h2><p>{selectedRashi.rashi} • {selectedRashi.english}</p></div></div><div className="rn-overview-range"><strong>{selectedRashi.startDegree}° – {selectedRashi.endDegree}°</strong><div className="progress"><div className="progress-bar" style={{ width: '100%' }} /></div><span>Start: {selectedRashi.startDegree}° · End: {selectedRashi.endDegree}°</span></div><div className="rn-overview-metrics"><strong>{selectedRashi.nakshatras.length} Nakshatra</strong><strong>{selectedPadas} Pada</strong></div></section>}
    <section className="rn-filter-bar" aria-label="Rashi Nakshatra filters"><div className="row g-3 align-items-end"><div className="col-12 col-lg-4"><label htmlFor="rn-search">Search Rashi, Nakshatra or Alphabet</label><input id="rn-search" className="form-control" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Rashi / Nakshatra / Alphabet" /></div><div className="col-6 col-md-4 col-lg-2"><label htmlFor="rn-nakshatra">Nakshatra</label><select id="rn-nakshatra" className="form-select" value={nakshatraFilter} onChange={(event) => setNakshatraFilter(event.target.value)}><option value="all">All Nakshatras</option>{nakshatraOptions.map((item) => <option key={item.name}>{item.name}</option>)}</select></div><div className="col-6 col-md-4 col-lg-2"><label htmlFor="rn-pada">Pada</label><select id="rn-pada" className="form-select" value={padaFilter} onChange={(event) => setPadaFilter(event.target.value)}><option value="all">All Pada</option>{[1, 2, 3, 4].map((pada) => <option value={pada} key={pada}>Pada {pada}</option>)}</select></div><div className="col-6 col-md-4 col-lg-2"><label htmlFor="rn-degree">Degree Range</label><select id="rn-degree" className="form-select" value={degreeRange} onChange={(event) => setDegreeRange(event.target.value)}><option value="all">All Ranges</option>{data.map((rashi) => <option value={`${rashi.startDegree}-${rashi.endDegree}`} key={rashi.rashiNo}>{rashi.startDegree}° – {rashi.endDegree}°</option>)}</select></div><div className="col-6 col-lg-2"><button className="btn rn-reset-button w-100" type="button" onClick={reset}><i className="bi bi-arrow-counterclockwise" /> Reset</button></div></div><div className="rn-filter-footer"><span>{activeCount} Filters Active</span><div className="btn-group" role="group" aria-label="View mode"><button className={`btn ${view === 'cards' ? 'active' : ''}`} type="button" onClick={() => setView('cards')}>▦ Cards</button><button className={`btn ${view === 'compact' ? 'active' : ''}`} type="button" onClick={() => setView('compact')}>☷ Compact</button></div></div></section>
    <section className="rn-results" aria-labelledby="rn-results-title"><div className="rn-results-heading"><div><span className="eyebrow">ASTROLOGY REFERENCE</span><h2 id="rn-results-title">Nakshatra Coverage</h2></div><span>Showing {filtered.length} records</span></div>{filtered.length ? (view === 'cards' ? <div className="row g-3">{filtered.map((item) => <div className="col-12 col-md-6 col-xl-4" key={`${item.rashi.rashiNo}-${item.name}`}><NakshatraCard item={item} onCopy={copyAlphabet} onDetails={setDetails} /></div>)}</div> : <div className="table-responsive rn-compact-wrap"><table className="table rn-compact-table"><thead><tr><th>Rashi</th><th>Nakshatra</th><th>Pada</th><th>Alphabet</th><th>Transliteration</th></tr></thead><tbody>{filtered.flatMap((item) => item.padas.map((pada) => <tr key={`${item.rashi.rashiNo}-${item.name}-${pada.pada}`}><td>{item.rashi.rashiMarathi} · {item.rashi.rashi}</td><td>{item.nameMarathi} · {item.name}</td><td>{pada.pada}</td><td><strong>{pada.alphabet}</strong></td><td>{pada.transliteration}</td></tr>))}</tbody></table></div>) : <div className="rn-empty"><i className="bi bi-search" /><strong>No matching Nakshatra or alphabet found.</strong><button className="btn rn-reset-button" type="button" onClick={reset}>Reset Filters</button></div>}</section>
    <section className="rn-how-to" aria-labelledby="rn-how-title"><div><span className="eyebrow">QUICK UNDERSTAND</span><h2 id="rn-how-title">How to Read This?</h2></div><div className="rn-flow"><span>Planet Degree</span><b>↓</b><span>Rashi</span><b>↓</b><span>Nakshatra</span><b>↓</b><span>Pada</span><b>↓</b><span>Name Alphabet</span></div><div className="rn-example"><strong>{quickItem ? `${quickItem.rashi.english} · ${quickItem.rashi.startDegree}°–${quickItem.rashi.endDegree}°` : 'Select a Rashi or search a Pada'}</strong><span>{quickItem && quickPada ? `→ ${quickItem.rashi.rashi} / ${quickItem.rashi.rashiMarathi} → ${quickItem.name} / ${quickItem.nameMarathi} → Pada ${quickPada.pada} → ${quickPada.alphabet} (${quickPada.transliteration})` : '→ Choose a result to see the Rashi → Nakshatra → Pada → Alphabet flow'}</span></div></section>
    {copyMessage && <div className="rn-copy-toast" role="status">{copyMessage}</div>}
    {details && <div className="rn-modal-backdrop" role="presentation" onClick={() => setDetails(null)}><div className="rn-modal" role="dialog" aria-modal="true" aria-labelledby="rn-modal-title" onClick={(event) => event.stopPropagation()}><header><div><span className="eyebrow">NAKSHATRA DETAILS</span><h2 id="rn-modal-title">{details.nameMarathi} · {details.name}</h2><p>{details.rashi.symbol} {details.rashi.rashiMarathi} · {details.rashi.rashi} · {details.rashi.english}</p><small>{details.rashi.startDegree}° – {details.rashi.endDegree}°</small></div><button type="button" onClick={() => setDetails(null)} aria-label="Close details"><i className="bi bi-x-lg" /></button></header><div className="rn-modal-padas">{details.padas.map((pada) => <PadaItem key={pada.pada} pada={pada} onCopy={copyAlphabet} />)}</div><button className="btn gold-action w-100" type="button" onClick={() => setDetails(null)}>Close</button></div></div>}
  </>;
}
