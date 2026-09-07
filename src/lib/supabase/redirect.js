import { rootPaths } from 'routes/paths';

export function normalizeAuthNextPath(nextPath) {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return rootPaths.root;
  }

  return nextPath;
}

export function getAuthCallbackUrl(nextPath = rootPaths.root) {
  if (typeof window === 'undefined') {
    return '';
  }

  const url = new URL('/auth/callback', window.location.origin);
  url.searchParams.set('next', normalizeAuthNextPath(nextPath));

  return url.toString();
}
