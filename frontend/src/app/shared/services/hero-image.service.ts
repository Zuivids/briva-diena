import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HeroImageResponse {
  path: string;
}

@Injectable({ providedIn: 'root' })
export class HeroImageService {
  private readonly base = '/api/hero-image';

  constructor(private http: HttpClient) {}

  getHeroImage(): Observable<HeroImageResponse> {
    return this.http.get<HeroImageResponse>(this.base);
  }

  uploadHeroImage(file: File): Observable<HeroImageResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<HeroImageResponse>(this.base, form);
  }
}
