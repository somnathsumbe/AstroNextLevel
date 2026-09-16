import { getUsers } from '@/lib/data/repositories/user.repository';

export function normalizeLoginKey(value) {
  return String(value || '').trim().toLowerCase();
}

export function findUserByUsername(username) {
  const normalized = normalizeLoginKey(username);
  return getUsers().find((user) => normalizeLoginKey(user.username) === normalized || normalizeLoginKey(user.email || '') === normalized) || null;
}

export function findUserByCredentials(identifier, password) {
  const user = findUserByUsername(identifier);
  if (!user) return null;
  if (user.status !== 'active') return null;
  if (String(user.password || '') !== String(password || '')) return null;
  return user;
}