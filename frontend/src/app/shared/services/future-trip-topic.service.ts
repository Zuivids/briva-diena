import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FutureTripTopic {
  id: number;
  title: string;
  description: string;
  sortOrder: number;
}

@Injectable({ providedIn: 'root' })
export class FutureTripTopicService {
  private readonly base = '/api/future-trip-topics';

  constructor(private http: HttpClient) {}

  getAll(): Observable<FutureTripTopic[]> {
    return this.http.get<FutureTripTopic[]>(this.base);
  }

  create(topic: Partial<FutureTripTopic>): Observable<FutureTripTopic> {
    return this.http.post<FutureTripTopic>(this.base, topic);
  }

  update(id: number, topic: Partial<FutureTripTopic>): Observable<FutureTripTopic> {
    return this.http.put<FutureTripTopic>(`${this.base}/${id}`, topic);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
