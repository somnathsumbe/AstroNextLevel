import records from '@/data/grahPastRecords.json';
import GrahPageHeader from '@/components/grah/GrahPageHeader';
import GrahSummary from '@/components/grah/GrahSummary';
import GrahCard from '@/components/grah/GrahCard';
import ReversalTimeData from '@/components/grah/ReversalTimeData';
import { getGrahSummary } from '@/utils/grahAnalysis';

export default function GrahPastRecordsPage() {
  const summary = getGrahSummary(records);

  return (
    <main className="container-fluid tool-page grah-records-page">
      <GrahPageHeader />
      {summary.hasDataError && <div className="alert alert-danger" role="alert"><i className="bi bi-exclamation-triangle me-2" />Some historical record data could not be read.</div>}
      <GrahSummary summary={summary} />
      {summary.validRecords.length === 0 ? <div className="grah-empty-state mb-4" role="status"><i className="bi bi-database-x" aria-hidden="true" /><strong>No Grah past records available.</strong><span>Historical planet data will appear here when available.</span></div> : <section className="mb-4" aria-labelledby="planet-records-title"><div className="grah-section-heading"><div><span className="eyebrow">HISTORICAL OBSERVATIONS</span><h2 id="planet-records-title">Planet-wise Historical Records</h2><p>Historical Nifty observations associated with each Grah</p></div><span className="grah-count">{summary.totalGrah} planets</span></div><div className="grah-simple-grid">{summary.validRecords.map((record) => <GrahCard record={record} key={record.planet} />)}</div></section>}
      <ReversalTimeData />
    </main>
  );
}