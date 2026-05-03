import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginResponse {
  mfaRequired?: boolean;
  mfaSetupRequired?: boolean;
  preToken?: string;
  secret?: string;
  qrCodeUri?: string;
}

export interface AuthToken {
  token: string;
  expiresIn: number;
}

export interface AdminProfile {
  username: string;
  mfaEnabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/admin';
  private tokenKey = 'adminToken';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Step 1: validate username + password. Returns MFA challenge info. */
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password });
  }

  /** Step 2: verify TOTP code and receive the full access token. */
  verifyMfa(preToken: string, code: string): Observable<AuthToken> {
    return this.http.post<AuthToken>(`${this.apiUrl}/login/verify-mfa`, { preToken, code }).pipe(
      tap(response => {
        this.setToken(response.token);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      error: () => {} // ignore errors — stateless logout
    });
    this.clearTokens();
    this.isAuthenticatedSubject.next(false);
  }

  getProfile(): Observable<AdminProfile> {
    return this.http.get<AdminProfile>(`${this.apiUrl}/profile`);
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private clearTokens(): void {
    localStorage.removeItem(this.tokenKey);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}

