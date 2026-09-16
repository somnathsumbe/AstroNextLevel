import { appSettingsService } from '@/lib/data/services/settings.service';

export const APP_SETTINGS_STORAGE_KEY = 'astro_app_settings';
export const USER_PREFERENCES_STORAGE_KEY = 'astro_user_preferences';

export function getAppConfiguration() {
  return appSettingsService.getSettings();
}

export function getDefaultTheme() {
  return getAppConfiguration().defaultTheme || 'dark-navy';
}

export function getCurrentUserPreferences() {
  const defaults = getAppConfiguration().userPreferences || {};

  if (typeof window === 'undefined') {
    return { ...defaults };
  }

  try {
    const saved = window.localStorage.getItem(USER_PREFERENCES_STORAGE_KEY);
    if (!saved) return { ...defaults };

    return { ...defaults, ...JSON.parse(saved) };
  } catch {
    return { ...defaults };
  }
}

export function saveUserPreferences(nextPreferences) {
  if (typeof window === 'undefined') {
    return { ...getCurrentUserPreferences(), ...nextPreferences };
  }

  const merged = { ...getCurrentUserPreferences(), ...nextPreferences };
  window.localStorage.setItem(USER_PREFERENCES_STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export function getPreferredTheme() {
  return getCurrentUserPreferences().theme || getDefaultTheme();
}

export function applyTheme(themeName) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = themeName || getDefaultTheme();
  }
}
