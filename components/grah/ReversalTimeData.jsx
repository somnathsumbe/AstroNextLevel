'use client';

import { useEffect, useMemo, useState } from 'react';

export default function ReversalTimeData() {
  const [state, setState] = useState({ loading: true, error: false, records: [], total: 0 });
  const [search, setSearch] = useState('');
  const [planet, setPlanet] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let active = true;
    fetch('/data/reversal-time.json')
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load reversal data');
        return response.json();
      })
      .then((payload) => {
        if (active) setState({ loading: false, error: false, records: Array.isArray(payload.data) ? payload.data : [], total: payload.recordsTotal || 0 });
      })
      .catch(() => {
        if (active) setState({ loading: false, error: true, records: [], total: 0 });
      });
    return () => { active = false; };
  }, []);

  const planets = useMemo(() => ['All', ...new Set(state.records.map((record) => record.grah_name.split(' - ')[0]))], [state.records]);
  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return state.records.filter((record) => {
      const matchesPlanet = planet === 'All' || record.grah_name.startsWith(`${planet} -`);
      const matchesSearch = !query || [record.grah_name, record.date, record.degree, record.end_time, record.trade_time].join(' ').toLowerCase().includes(query);
      return matchesPlanet && matchesSearch;
    });
  }, [planet, search, state.records]);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const visibleRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);
  const updateSearch = (value) => { setSearch(value); setPage(1); };
  const updatePlanet = (value) => { setPlanet(value); setPage(1); };
  const updatePageSize = (value) => { setPageSize(Number(value)); setPage(1); };

  return (
    <section className="grah-reversal-preview" aria-labelledby="grah-reversal-title">
      <div className="grah-section-heading">
        <div>
          <span className="eyebrow">REVERSAL TIME DATA</span>
          <h2 id="grah-reversal-title">Historical Reversal Observation</h2>
          <p>Planet reversal timing, degree and trade time from the local JSON dataset.</p>
        </div>
        <span className="grah-count">{state.total || state.records.length} total · {state.records.length} loaded</span>
      </div>
      {state.loading ? <div className="grah-reversal-state" role="status"><span className="spinner-border spinner-border-sm" /> Loading reversal data...</div> : state.error ? <div className="grah-reversal-state text-danger" role="alert">Unable to load reversal data.</div> : state.records.length === 0 ? <div className="grah-reversal-state">No reversal records available.</div> : <>
        <div className="row g-2 mb-3 align-items-end">
          <div className="col-12 col-md-5"><label className="grah-filter-label" htmlFor="reversal-search">Search records</label><input id="reversal-search" className="form-control grah-filter-input" value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Search planet, date, degree or time" /></div>
          <div className="col-6 col-md-3"><label className="grah-filter-label" htmlFor="reversal-planet">Planet</label><select id="reversal-planet" className="form-select grah-filter-input" value={planet} onChange={(event) => updatePlanet(event.target.value)}>{planets.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div className="col-6 col-md-2"><label className="grah-filter-label" htmlFor="reversal-page-size">Show</label><select id="reversal-page-size" className="form-select grah-filter-input" value={pageSize} onChange={(event) => updatePageSize(event.target.value)}><option value="10">10</option><option value="25">25</option><option value="50">50</option></select></div>
          <div className="col-12 col-md-2"><span className="grah-result-count">{filteredRecords.length} matching records</span></div>
        </div>
        {visibleRecords.length === 0 ? <div className="grah-reversal-state">No records match the selected filters.</div> : <div className="table-responsive"><table className="table grah-reversal-table"><caption className="visually-hidden">Reversal time historical records</caption><thead><tr><th>#</th><th>Date</th><th>Planet</th><th>Degree</th><th>Trade Time</th><th>Reversal Time</th></tr></thead><tbody>{visibleRecords.map((record) => <tr key={record.id}><td>{record.DT_RowIndex}</td><td>{record.date}</td><td><strong>{record.grah_name.split(' - ')[0]}</strong><small>{record.grah_name.split(' - ')[1]}</small></td><td>{record.degree}°</td><td>{record.trade_time}</td><td>{record.end_time}</td></tr>)}</tbody></table></div>}
        <div className="grah-pagination"><span>Showing {filteredRecords.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, filteredRecords.length)} of {filteredRecords.length}</span><div className="btn-group" role="group" aria-label="Reversal records pagination"><button className="btn subtle-action" type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button><button className="btn subtle-action" type="button" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>Next</button></div></div>
      </>}
    </section>
  );
}
