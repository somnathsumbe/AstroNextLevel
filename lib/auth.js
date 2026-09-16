import { findUserByCredentials } from '@/lib/data/services/user.service';

export const AUTH_STORAGE_KEY = 'astro_logged_user';

export function authenticate(username, password) {
  const user = findUserByCredentials(username, password);

  if (!user) {
    return { ok: false, reason: 'invalid' };
  }

  const safeUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    email: user.email,
  };

  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeUser));
  } catch {
    return { ok: false, reason: 'storage' };
  }

  return { ok: true, user: safeUser };
}

export function getLoggedUser() {
  if (typeof window === 'undefined') return null;

  const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!storedUser) return null;

  try {
    const parsed = JSON.parse(storedUser);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid auth payload');
    }
    return parsed;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function updateLoggedUser(nextUser) {
  if (!nextUser || typeof window === 'undefined') {
    return null;
  }

  const safeUser = {
    id: nextUser.id,
    username: nextUser.username,
    name: nextUser.name,
    role: nextUser.role,
    email: nextUser.email,
  };

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeUser));
  return safeUser;
}

export function logout() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem('astro_remember_login');
  }
}

export function isAuthenticated() {
  return Boolean(getLoggedUser());
}
