import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NewsletterSignup {
  id: number;
  email: string;
  topic: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NewsletterService {
  private readonly base = '/api/newsletter-signups';

  constructor(private http: HttpClient) {}

  signup(email: string, topic: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(this.base, { email, topic });
  }

  getAll(): Observable<NewsletterSignup[]> {
    return this.http.get<NewsletterSignup[]>(this.base);
  }

  update(id: number, email: string, topic: string): Observable<NewsletterSignup> {
    return this.http.put<NewsletterSignup>(`${this.base}/${id}`, { email, topic });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  sendBroadcast(emails: string[], message: string): Observable<{ success: boolean; sentCount: number }> {
    return this.http.post<{ success: boolean; sentCount: number }>(`${this.base}/send-email`, { emails, message });
  }
}
