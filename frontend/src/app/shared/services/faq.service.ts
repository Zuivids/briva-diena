import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FaqItem } from '../models/faq.model';

@Injectable({ providedIn: 'root' })
export class FaqService {
  private readonly apiUrl = '/api/faq';

  constructor(private http: HttpClient) {}

  getAll(): Observable<FaqItem[]> {
    return this.http.get<FaqItem[]>(this.apiUrl);
  }

  create(question: string, answer: string): Observable<FaqItem> {
    return this.http.post<FaqItem>(this.apiUrl, { question, answer });
  }

  update(id: number, question: string, answer: string): Observable<FaqItem> {
    return this.http.put<FaqItem>(`${this.apiUrl}/${id}`, { question, answer });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
