import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip, TripFilter } from '../models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private apiUrl = 'http://localhost:8080/api/trips';

  constructor(private http: HttpClient) {}

  /**
   * Get all trips with optional filters
   */
  getAllTrips(filters?: TripFilter): Observable<Trip[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.month) {
        params = params.set('month', filters.month.toString());
      }
      if (filters.durationDays) {
        params = params.set('durationDays', filters.durationDays);
      }
      if (filters.maxPrice) {
        params = params.set('maxPrice', filters.maxPrice.toString());
      }
    }

    return this.http.get<Trip[]>(this.apiUrl, { params });
  }

  /**
   * Get featured trips (4 nearest available trips)
   */
  getFeaturedTrips(limit: number = 4): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.apiUrl}/featured`, {
      params: new HttpParams().set('limit', limit.toString())
    });
  }

  /**
   * Get trips for a landing page section (TOP or LAST_CHANCE)
   */
  getLandingTrips(section: string): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.apiUrl}/landing`, {
      params: new HttpParams().set('section', section)
    });
  }

  /**
   * Get a specific trip by ID
   */
  getTrip(tripId: string): Observable<Trip> {
    return this.http.get<Trip>(`${this.apiUrl}/${tripId}`);
  }

  /**
   * Create a new trip (admin only)
   */
  createTrip(trip: Trip): Observable<Trip> {
    return this.http.post<Trip>(this.apiUrl, trip);
  }

  /**
   * Update an existing trip (admin only)
   */
  updateTrip(tripId: string, trip: Partial<Trip>): Observable<Trip> {
    return this.http.put<Trip>(`${this.apiUrl}/${tripId}`, trip);
  }

  /**
   * Delete a trip (admin only)
   */
  deleteTrip(tripId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tripId}`);
  }

  /**
   * Get trip images
   */
  getTripImages(tripId: string): Observable<{ id: number; path: string; isCover: boolean }[]> {
    return this.http.get<{ id: number; path: string; isCover: boolean }[]>(`${this.apiUrl}/${tripId}/images`);
  }

  /**
   * Get cover image for a trip
   */
  getCoverImage(tripId: string): Observable<{ id: number; path: string }> {
    return this.http.get<{ id: number; path: string }>(`${this.apiUrl}/${tripId}/cover`);
  }

  /**
   * Set an image as the cover for a trip
   */
  setCoverImage(tripId: string, imageId: number): Observable<{ id: number; path: string; isCover: boolean }> {
    return this.http.put<{ id: number; path: string; isCover: boolean }>(`${this.apiUrl}/${tripId}/images/${imageId}/cover`, {});
  }

  /**
   * Upload an image for a trip
   */
  uploadImage(tripId: string, file: File): Observable<{ id: number; path: string; isCover: boolean }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ id: number; path: string; isCover: boolean }>(`${this.apiUrl}/${tripId}/images`, formData);
  }

  /**
   * Delete a trip image
   */
  deleteImage(tripId: string, imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tripId}/images/${imageId}`);
  }

  /**
   * Get background images for landing page
   */
  getBackgroundImages(): Observable<string[]> {
    return this.http.get<string[]>('http://localhost:8080/api/images/background');
  }
}
