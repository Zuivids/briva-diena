import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FAQ } from '../models/faq.model';

@Injectable({
  providedIn: 'root'
})
export class FAQService {
  private apiUrl = 'http://localhost:8080/api/faqs';

  constructor(private http: HttpClient) {}

  /**
   * Get all FAQs
   */
  getAllFAQs(): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(this.apiUrl);
  }

  /**
   * Get FAQs by category
   */
  getFAQsByCategory(category: string): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(this.apiUrl, {
      params: new HttpParams().set('category', category)
    });
  }

  /**
   * Get a specific FAQ by ID
   */
  getFAQ(faqId: string): Observable<FAQ> {
    return this.http.get<FAQ>(`${this.apiUrl}/${faqId}`);
  }

  /**
   * Create a new FAQ (admin only)
   */
  createFAQ(faq: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>): Observable<FAQ> {
    return this.http.post<FAQ>(this.apiUrl, faq);
  }

  /**
   * Update a FAQ (admin only)
   */
  updateFAQ(faqId: string, faq: Partial<FAQ>): Observable<FAQ> {
    return this.http.put<FAQ>(`${this.apiUrl}/${faqId}`, faq);
  }

  /**
   * Delete a FAQ (admin only)
   */
  deleteFAQ(faqId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${faqId}`);
  }

  /**
   * Get all FAQ categories
   */
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }
}
