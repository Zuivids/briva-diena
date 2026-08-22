#!/usr/bin/env node
// Runs before `ng build`. Fetches the live trip list and writes:
//   - prerender-routes.txt  (parameterized routes for Angular's build-time prerenderer)
//   - public/sitemap.xml    (copied into dist/frontend/browser as a static asset)
//
// The slug algorithm here MUST stay in sync with
// src/app/shared/utils/trip-slug.util.ts — it's the sole lookup key for the
// canonical /:slug trip URL, so a mismatch here means a sitemap link that 404s.

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const API_BASE = process.env.API_BASE_URL || 'http://localhost:8080';
const SITE_URL = 'https://brivadiena.lv';

const STATIC_PAGES = [
  '/', '/trips', '/about', '/contacts', '/reviews', '/faq',
  '/jaunumi-par-celojumiem',
  '/policies/privacy-policy',
  '/policies/pirmsliguma-informacija',
  '/policies/standarta-informacijas-veidlapa',
];

function slugifyTripName(name) {
  return name
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatSlugDate(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return `${day}-${month}-${year}`;
}

function tripSlug(name, startDate) {
  return `${slugifyTripName(name)}-${formatSlugDate(startDate)}`;
}

function xmlEscape(s) {
  return s.replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

async function fetchTrips() {
  try {
    const res = await fetch(`${API_BASE}/api/trips`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const trips = await res.json();
    return trips.filter(t => !t.hidden);
  } catch (err) {
    console.warn(
      `[seo-build] Could not fetch trips from ${API_BASE}/api/trips (${err.message}). ` +
      'Trip pages will fall back to client-side rendering until a build runs with a reachable backend.'
    );
    return [];
  }
}

async function main() {
  const trips = await fetchTrips();

  const routeLines = [];
  const urlEntries = STATIC_PAGES.map(path => ({ loc: `${SITE_URL}${path}` }));

  for (const trip of trips) {
    const slug = tripSlug(trip.name, trip.startDate);
    routeLines.push(`/${slug}`);
    routeLines.push(`/trip/${trip.id}`); // legacy alias, kept prerendered too
    urlEntries.push({
      loc: `${SITE_URL}/${slug}`,
      lastmod: (trip.createdAt || '').slice(0, 10) || undefined
    });
  }

  await writeFile(join(ROOT, 'prerender-routes.txt'), routeLines.join('\n') + '\n', 'utf8');

  const urlsXml = urlEntries
    .map(u => `  <url>\n    <loc>${xmlEscape(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}\n  </url>`)
    .join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlsXml}\n</urlset>\n`;
  await writeFile(join(ROOT, 'public', 'sitemap.xml'), sitemap, 'utf8');

  console.log(`[seo-build] Wrote ${routeLines.length} prerender route(s) and ${urlEntries.length} sitemap ${urlEntries.length === 1 ? 'entry' : 'entries'}.`);
}

main();
