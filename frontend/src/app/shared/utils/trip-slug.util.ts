/**
 * Strips diacritics (incl. Latvian a-/c^/e-/g^/i-/k^/l^/n^/s^/u-/z^) and turns a
 * trip name into a URL-safe slug segment.
 */
export function slugifyTripName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "2026-11-04" -> "04-11-2026" (dd-MM-yyyy). */
export function formatSlugDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}-${month}-${year}`;
}

/**
 * The trip's unique URL slug — this is the sole lookup key for the flat
 * `/:slug` route (there is no id in the canonical URL), so it must stay in
 * sync with the identical algorithm in scripts/generate-seo-build-files.mjs.
 * e.g. "Iseo ezers un Bergamo" + "2026-08-01" -> "iseo-ezers-un-bergamo-01-08-2026"
 */
export function tripSlug(name: string, startDate: string): string {
  return `${slugifyTripName(name)}-${formatSlugDate(startDate)}`;
}

/** Canonical router path for a trip's detail page: /iseo-ezers-un-bergamo-01-08-2026 */
export function tripDetailPath(name: string, startDate: string): string {
  return `/${tripSlug(name, startDate)}`;
}
