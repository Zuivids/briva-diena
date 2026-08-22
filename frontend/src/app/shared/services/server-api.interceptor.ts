import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * During SSR/prerendering there is no browser origin to resolve relative
 * `/api/...` and `/images/...` URLs against, so Node can't fetch them.
 * Only active server-side (isPlatformServer) — the browser bundle keeps
 * using relative URLs through the normal nginx/dev-server proxy.
 */
@Injectable()
export class ServerApiInterceptor implements HttpInterceptor {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (isPlatformServer(this.platformId) && (req.url.startsWith('/api') || req.url.startsWith('/images'))) {
      const base = (typeof process !== 'undefined' && process.env['API_BASE_URL']) || 'http://localhost:8080';
      req = req.clone({ url: base + req.url });
    }
    return next.handle(req);
  }
}
