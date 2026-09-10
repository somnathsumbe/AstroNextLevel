const registeredEvents = new Map();
const registeredProviders = new Map();

export function registerAstroEvents(events, source = 'default') {
  registeredEvents.set(source, Array.isArray(events) ? events : []);
  return getRegisteredAstroEvents();
}

export function registerAstroEventProvider(source, provider) {
  registeredProviders.set(source, provider);
  return () => registeredProviders.delete(source);
}

export function getRegisteredAstroEvents() {
  const providerEvents = [...registeredProviders.values()].flatMap((provider) => provider() || []);
  return [...registeredEvents.values()].flat().concat(providerEvents);
}

export function clearAstroEventRegistry() {
  registeredEvents.clear();
  registeredProviders.clear();
}
