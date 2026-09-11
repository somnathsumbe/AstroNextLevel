export default function Loading() {
  return (
    <main className="container-fluid tool-page grah-records-page" aria-busy="true" aria-live="polite">
      <div className="grah-loading-state"><span className="spinner-border spinner-border-sm" aria-hidden="true" /> Loading Grah historical analysis...</div>
    </main>
  );
}