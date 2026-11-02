// The admin panel lives on its own page. Change this one line to rename the URL.
// (public/_redirects has the same path, change it there too.)
export const ADMIN_PATH = '/dihanadmin';

/** True for /dihanadmin, /dihanadmin/ and /DihanAdmin (case and trailing slash do not matter). */
export function isAdminPath(pathname: string): boolean {
  const clean = (pathname || '').replace(/\/+$/, '').toLowerCase();
  return clean === ADMIN_PATH.toLowerCase();
}
