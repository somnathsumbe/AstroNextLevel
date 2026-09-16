function getPublicDataUrl(fileName) {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/AstroNextLevel')) {
    return `/AstroNextLevel/data/${fileName}`;
  }
  return `/data/${fileName}`;
}

async function fetchPublicJson(fileName) {
  const response = await fetch(getPublicDataUrl(fileName));
  if (!response.ok) throw new Error(`Unable to load ${fileName}.`);
  return response.json();
}

export function getGannPressureData() {
  return fetchPublicJson('gann-pressure-dates.json');
}

export function getReversalTimeData() {
  return fetchPublicJson('reversal-time.json');
}