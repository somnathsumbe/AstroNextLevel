import PageHeader from '@/components/common/PageHeader';

export default function GannHeader() {
  return <PageHeader
    className="gann-today-heading"
    eyebrow="MARKET ANALYSIS"
    title="Today Stock Pressure"
    description="Stock-wise Gann angle pressure dates and market observation zones"
    breadcrumb={<><i className="bi bi-house" /> <a href="/dashboard">Dashboard</a> <span>/</span> Today Stock</>}
    actions={<div className="gann-today-chip"><i className="bi bi-clock-history" /> India time · Asia/Kolkata</div>}
  />;
}