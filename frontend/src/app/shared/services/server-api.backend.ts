import { Injectable, inject } from '@angular/core';
import { FetchBackend, HttpBackend, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Server-only HttpBackend (provided in app.config.server.ts, never shipped to
 * the browser). Node can't resolve a relative "/api/..." URL, so this
 * redirects the actual network call to the live backend — WITHOUT touching
 * HttpRequest.url. That distinction matters: Angular's HTTP transfer cache
 * (provideClientHydration) keys its cache by req.url, computed upstream of
 * the backend. Rewriting req.url in an interceptor (the previous approach)
 * made the server's cache key differ from the client's identical relative
 * request, so the transfer cache never hit — the client silently re-fetched
 * everything on hydration, and the resulting state mismatch corrupted the
 * DOM (this is what broke the "Gaidāmie ceļojumi" trip cards in production).
 */
@Injectable()
export class ServerApiBackend implements HttpBackend {
  private readonly delegate = inject(FetchBackend);

  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    if (req.url.startsWith('/api') || req.url.startsWith('/images')) {
      const base = (typeof process !== 'undefined' && process.env['API_BASE_URL']) || 'http://localhost:8080';
      req = req.clone({ url: base + req.url });
    }
    return this.delegate.handle(req);
  }
}
