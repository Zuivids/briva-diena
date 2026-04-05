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
  getTripImages(tripId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${tripId}/images`);
  }

  /**
   * Get background images for landing page
   */
  getBackgroundImages(): Observable<string[]> {
    return this.http.get<string[]>('http://localhost:8080/api/images/background');
  }
}
