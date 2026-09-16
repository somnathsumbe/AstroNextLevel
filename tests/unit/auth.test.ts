import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import {
  AUTH_STORAGE_KEY,
  authenticate,
  getLoggedUser,
  isAuthenticated,
  logout,
  updateLoggedUser,
} from '@/lib/auth';

type StorageMap = Record<string, string>;

function createStorage() {
  const values: StorageMap = {};
  return {
    getItem: (key: string) => values[key] ?? null,
    setItem: (key: string, value: string) => { values[key] = String(value); },
    removeItem: (key: string) => { delete values[key]; },
    clear: () => { Object.keys(values).forEach((key) => delete values[key]); },
  };
}

describe('development authentication', () => {
  const storage = createStorage();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal('window', { localStorage: storage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('authenticates the active development user and stores only safe fields', () => {
    const result = authenticate(' ADMIN ', 'admin');

    expect(result.ok).toBe(true);
    expect(result.user).toMatchObject({ username: 'admin', role: 'admin' });
    expect(result.user).not.toHaveProperty('password');
    expect(JSON.parse(storage.getItem(AUTH_STORAGE_KEY) || '{}')).not.toHaveProperty('password');
    expect(isAuthenticated()).toBe(true);
  });

  it('rejects invalid credentials without creating a session', () => {
    expect(authenticate('admin', 'wrong-password')).toMatchObject({ ok: false, reason: 'invalid' });
    expect(getLoggedUser()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it('clears the session and remembered login during logout', () => {
    authenticate('admin', 'admin');
    storage.setItem('astro_remember_login', 'admin');

    logout();

    expect(getLoggedUser()).toBeNull();
    expect(storage.getItem('astro_remember_login')).toBeNull();
  });

  it('clears malformed stored state instead of trusting it', () => {
    storage.setItem(AUTH_STORAGE_KEY, '{invalid');

    expect(getLoggedUser()).toBeNull();
    expect(storage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('persists only the safe profile subset when updating a user', () => {
    const updated = updateLoggedUser({ id: 1, username: 'admin', name: 'Admin', role: 'admin', email: 'admin@example.com', password: 'secret' });

    expect(updated).toMatchObject({ id: 1, username: 'admin', name: 'Admin' });
    expect(updated).not.toHaveProperty('password');
  });
});
