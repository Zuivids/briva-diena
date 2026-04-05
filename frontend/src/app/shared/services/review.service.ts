import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:8080/api/reviews';

  constructor(private http: HttpClient) {}

  /**
   * Get all reviews with optional pagination
   */
  getAllReviews(page: number = 1, limit: number = 10): Observable<{ reviews: Review[]; total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<{ reviews: Review[]; total: number }>(this.apiUrl, { params });
  }

  /**
   * Get latest reviews (for landing page)
   */
  getLatestReviews(limit: number = 3): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/latest`, {
      params: new HttpParams().set('limit', limit.toString())
    });
  }

  /**
   * Get reviews for a specific trip
   */
  getTripReviews(tripId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  /**
   * Submit a new review
   */
  submitReview(review: Omit<Review, 'id' | 'createdAt'>): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, review);
  }

  /**
   * Get a specific review by ID
   */
  getReview(reviewId: string): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/${reviewId}`);
  }

  /**
   * Update a review (admin only)
   */
  updateReview(reviewId: string, review: Partial<Review>): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${reviewId}`, review);
  }

  /**
   * Delete a review (admin only)
   */
  deleteReview(reviewId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reviewId}`);
  }

  /**
   * Approve a review (admin only)
   */
  approveReview(reviewId: string): Observable<Review> {
    return this.http.patch<Review>(`${this.apiUrl}/${reviewId}/approve`, {});
  }

  /**
   * Reject a review (admin only)
   */
  rejectReview(reviewId: string, reason?: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${reviewId}/reject`, { reason });
  }
}
