import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InstagramPost {
  id: number;
  url: string;
  sortOrder: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class InstagramService {
  private apiUrl = 'http://localhost:8080/api/instagram-posts';

  constructor(private http: HttpClient) {}

  getAll(): Observable<InstagramPost[]> {
    return this.http.get<InstagramPost[]>(this.apiUrl);
  }

  add(url: string): Observable<InstagramPost> {
    return this.http.post<InstagramPost>(this.apiUrl, { url });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
