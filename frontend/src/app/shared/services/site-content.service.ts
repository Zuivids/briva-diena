import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SiteContentService {
  private readonly base = '/api/site-content';

  constructor(private http: HttpClient) {}

  get(key: string): Observable<{ key: string; value: string }> {
    return this.http.get<{ key: string; value: string }>(`${this.base}/${key}`);
  }

  save(key: string, value: string): Observable<{ key: string; value: string }> {
    return this.http.put<{ key: string; value: string }>(`${this.base}/${key}`, { value });
  }
}
