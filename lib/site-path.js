export const BASE_PATH = '/AstroNextLevel';

export function getRoutePath(pathname) {
  if (!pathname) return '/';
  const routePath = pathname === BASE_PATH
    ? '/'
    : pathname.startsWith(`${BASE_PATH}/`)
      ? pathname.slice(BASE_PATH.length)
      : pathname;
  return routePath.length > 1 ? routePath.replace(/\/$/, '') : routePath;
}