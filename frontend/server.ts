import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser. index:false is required — with no
  // build-time prerendering, browser/index.html is just the bare CSR shell,
  // and express.static's default "index" behavior would silently serve that
  // shell for "/" (and any other directory-style request) before the SSR
  // handler below ever ran.
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
  }));

  // Time-based revalidation ("ISR"): render on demand, then serve that HTML
  // to everyone else for SSR_CACHE_TTL_MS before rendering again. Bounds
  // staleness of live trip data (spots, price, visibility) to a fixed
  // window instead of "until next deploy" — see server-api.backend.ts for
  // why the API call inside render() is always live.
  const SSR_CACHE_TTL_MS = Number(process.env['SSR_CACHE_TTL_MS']) || 60_000;
  const renderCache = new Map<string, { html: string; expires: number }>();

  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    const cached = renderCache.get(originalUrl);
    if (cached && cached.expires > Date.now()) {
      res.set('Cache-Control', 'public, max-age=0, must-revalidate');
      res.send(cached.html);
      return;
    }

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => {
        renderCache.set(originalUrl, { html, expires: Date.now() + SSR_CACHE_TTL_MS });
        res.set('Cache-Control', 'public, max-age=0, must-revalidate');
        res.send(html);
      })
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
