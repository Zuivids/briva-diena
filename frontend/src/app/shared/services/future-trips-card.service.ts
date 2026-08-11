import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FutureTripsCard {
  title: string;
  enabled: boolean;
  imagePath: string;
  introText: string;
}

@Injectable({ providedIn: 'root' })
export class FutureTripsCardService {
  private readonly base = '/api/future-trips-card';

  constructor(private http: HttpClient) {}

  get(): Observable<FutureTripsCard> {
    return this.http.get<FutureTripsCard>(this.base);
  }

  updateSettings(title: string, enabled: boolean, introText: string): Observable<FutureTripsCard> {
    return this.http.patch<FutureTripsCard>(`${this.base}/settings`, { title, enabled, introText });
  }

  uploadImage(file: File): Observable<FutureTripsCard> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<FutureTripsCard>(this.base, formData);
  }
}
