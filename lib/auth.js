import users from '@/data/users.json';

export const AUTH_STORAGE_KEY = 'astro_logged_user';

export function authenticate(username, password) {
  const user = users.find((candidate) => candidate.username === username);

  if (!user) {
    return { ok: false, reason: 'invalid' };
  }

  if (user.status !== 'active') {
    return { ok: false, reason: 'inactive' };
  }

  if (user.password !== password) {
    return { ok: false, reason: 'invalid' };
  }

  const safeUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    email: user.email,
  };

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeUser));
  return { ok: true, user: safeUser };
}

export function getLoggedUser() {
  if (typeof window === 'undefined') return null;

  const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function logout() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isAuthenticated() {
  return Boolean(getLoggedUser());
}
