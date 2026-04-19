import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Registration } from '../models/registration.model';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = '/api/registrations';

  constructor(private http: HttpClient) {}

  createRegistration(registration: Omit<Registration, 'id' | 'createdAt'>): Observable<Registration> {
    return this.http.post<Registration>(this.apiUrl, registration);
  }

  getRegistration(id: string): Observable<Registration> {
    return this.http.get<Registration>(`${this.apiUrl}/${id}`);
  }
}
