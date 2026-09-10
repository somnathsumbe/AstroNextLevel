import type { MarketRecord } from '@/src/types/weekly-market-tracking';
import type { SunJupiterRecord } from '@/src/types/sun-jupiter';

export function exportMarketCsv(records: MarketRecord[]): void {
  const headers = ['Target Degree', 'Crossing Date', 'Day', 'Observation Time', 'Observed Degree'];
  const rows = records.map((record) => [
    record.targetDegree,
    record.dateLabel,
    record.day,
    record.observationTime,
    record.observedDegree.toFixed(6),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'jupiter-venus-tracking.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export function exportSunJupiterCsv(records: SunJupiterRecord[]): void {
  const headers = ['Date', 'Test Date', 'Week Testing', 'Day', 'Time IST', 'Angle', 'Aspect'];
  const rows = records.map((record) => [
    record.dateLabel,
    record.testDateLabel,
    record.weekLabel,
    record.day,
    record.timeIST,
    `${record.angle}°`,
    record.aspect,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sun-jupiter-weekly-market-tracking.csv';
  link.click();
  URL.revokeObjectURL(url);
}
