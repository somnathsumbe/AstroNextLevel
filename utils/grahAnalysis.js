export function isValidGrahRecord(record) {
  return record
    && typeof record.planet === 'string'
    && typeof record.icon === 'string'
    && Number.isFinite(record.totalRecords)
    && Number.isFinite(record.niftyDataRecords)
    && Number.isFinite(record.niftyDataBase)
    && Number.isFinite(record.avgPointsMove);
}

export function getValidGrahRecords(records) {
  return Array.isArray(records) ? records.filter(isValidGrahRecord) : [];
}

export function getGrahAvailability(record) {
  if (!record || record.niftyDataBase <= 0) return 0;
  return Math.round((record.niftyDataRecords / record.niftyDataBase) * 100);
}

export function getGrahSummary(records) {
  const validRecords = getValidGrahRecords(records);
  const rankedRecords = [...validRecords].sort((first, second) => second.avgPointsMove - first.avgPointsMove);
  const highest = rankedRecords[0] || null;
  const lowest = rankedRecords[rankedRecords.length - 1] || null;

  return {
    validRecords,
    rankedRecords,
    totalGrah: validRecords.length,
    totalHistoricalRecords: validRecords.reduce((total, record) => total + record.totalRecords, 0),
    highest,
    lowest,
    hasDataError: !Array.isArray(records) || validRecords.length !== records.length,
  };
}

