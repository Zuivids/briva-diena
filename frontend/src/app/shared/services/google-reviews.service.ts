import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GoogleReview {
  authorName: string;
  authorPhotoUrl: string | null;
  rating: number;
  relativeTimeDescription: string;
  text: string;
  time: number;
}

export interface GoogleReviewsData {
  configured: boolean;
  fullReviewsConfigured: boolean;
  overallRating: number | null;
  totalRatingCount: number | null;
  placeUrl: string | null;
  lastFetchedAt: string | null;
  lastError: string | null;
  reviews: GoogleReview[];
}

@Injectable({ providedIn: 'root' })
export class GoogleReviewsService {
  private readonly base = '/api/google-reviews';

  constructor(private http: HttpClient) {}

  get(): Observable<GoogleReviewsData> {
    return this.http.get<GoogleReviewsData>(this.base);
  }

  refresh(): Observable<GoogleReviewsData> {
    return this.http.post<GoogleReviewsData>(`${this.base}/refresh`, {});
  }
}
