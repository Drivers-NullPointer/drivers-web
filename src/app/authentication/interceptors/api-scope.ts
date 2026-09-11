import { environment } from '../../../environments/environment';

export function apiPath(url: string): string | null {
  try {
    const base = new URL(environment.apiUrl + environment.apiVersion, globalThis.location?.origin);
    const target = new URL(url, globalThis.location?.origin);
    const prefix = base.pathname.replace(/\/$/, '');
    if (target.origin !== base.origin || !target.pathname.startsWith(prefix + '/')) return null;
    return target.pathname.slice(prefix.length);
  } catch { return null; }
}

export const publicSessionPaths = new Set([
  '/auth/login', '/auth/refresh', '/auth/logout', '/auth/verify-account',
  '/auth/forgot-password', '/auth/reset-password', '/account/deletion-request',
  '/account/deletion-confirmation', '/client/register', '/driver/register'
]);
