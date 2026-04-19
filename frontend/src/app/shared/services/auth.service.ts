import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AuthToken {
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface AdminProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/admin';
  private tokenKey = 'adminToken';
  private refreshTokenKey = 'adminRefreshToken';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private adminProfileSubject = new BehaviorSubject<AdminProfile | null>(null);
  public adminProfile$ = this.adminProfileSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkTokenValidity();
  }

  /**
   * Admin login with email and password
   */
  login(email: string, password: string): Observable<AuthToken> {
    return this.http.post<AuthToken>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        this.setToken(response.token);
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  /**
   * Admin logout
   */
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => {
        this.clearTokens();
        this.isAuthenticatedSubject.next(false);
        this.adminProfileSubject.next(null);
      },
      error: () => {
        // Clear tokens even if logout request fails
        this.clearTokens();
        this.isAuthenticatedSubject.next(false);
        this.adminProfileSubject.next(null);
      }
    });
  }

  /**
   * Get current admin profile
   */
  getProfile(): Observable<AdminProfile> {
    return this.http.get<AdminProfile>(`${this.apiUrl}/profile`).pipe(
      tap(profile => {
        this.adminProfileSubject.next(profile);
      })
    );
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): Observable<AuthToken> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http.post<AuthToken>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      tap(response => {
        this.setToken(response.token);
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }
      })
    );
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  /**
   * Get the authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get the refresh token
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Set the authentication token
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Set the refresh token
   */
  private setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  /**
   * Clear all tokens
   */
  private clearTokens(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  /**
   * Check if token exists
   */
  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  /**
   * Check token validity
   */
  private checkTokenValidity(): void {
    if (this.hasToken()) {
      this.isAuthenticatedSubject.next(true);
    }
  }
}
