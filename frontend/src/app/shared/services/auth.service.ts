import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

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

  private readonly INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly activityEvents = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
  private boundReset = () => this.scheduleInactivityTimeout();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, private ngZone: NgZone) {
    // Resume inactivity watch on page refresh if already logged in
    if (this.hasToken()) {
      this.startInactivityWatch();
    }
  }

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
        this.startInactivityWatch();
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      error: () => {} // ignore errors — stateless logout
    });
    this.stopInactivityWatch();
    this.clearTokens();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/']);
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

  private startInactivityWatch(): void {
    this.ngZone.runOutsideAngular(() => {
      this.activityEvents.forEach(e => window.addEventListener(e, this.boundReset, { passive: true }));
      this.scheduleInactivityTimeout();
    });
  }

  private scheduleInactivityTimeout(): void {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    this.inactivityTimer = setTimeout(() => {
      this.ngZone.run(() => this.logout());
    }, this.INACTIVITY_MS);
  }

  private stopInactivityWatch(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    this.activityEvents.forEach(e => window.removeEventListener(e, this.boundReset));
  }
}

