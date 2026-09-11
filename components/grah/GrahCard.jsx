import { getGrahAvailability } from '@/utils/grahAnalysis';

export default function GrahCard({ record }) {
  const availability = getGrahAvailability(record);

  return (
    <article className="grah-simple-card h-100">
      <header className="grah-simple-card-header">
        <span className="grah-simple-icon" aria-hidden="true">{record.icon}</span>
        <h3 className="mb-0">{record.planet} <span>({record.marathiName})</span></h3>
      </header>
      <div className="grah-simple-metric" title="Average Nifty points movement observed in historical records">
        <strong>{record.avgPointsMove.toFixed(2)}</strong>
        <span>Avg Points Move</span>
      </div>
      <div className="grah-simple-stats">
        <span>{record.totalRecords} records</span>
        <span>{availability}% data</span>
      </div>
    </article>
  );
}