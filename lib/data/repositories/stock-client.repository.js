async function readResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.error?.message || fallbackMessage);
  }
  return payload;
}

export async function getAllStockRecords() {
  const response = await fetch('/api/stocks/today?all=1');
  return readResponse(response, 'Unable to load stock pressure data.');
}

export async function getTodayStockRecords() {
  const response = await fetch('/api/stocks/today');
  return readResponse(response, 'Unable to load today stock pressure data.');
}

export async function generateStockRecords(request) {
  const response = await fetch('/api/stocks/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return readResponse(response, 'Unable to generate stock pressure data.');
}