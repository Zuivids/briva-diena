import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AdminTrip {
  id: number;
  title: string;
  destination: string;
  dateRange: string;
  price: number;
  description: string;
}

export interface AdminReview {
  id: number;
  name: string;
  text: string;
  rating: number;
}

@Injectable({ providedIn: 'root' })
export class AdminStateService {
  private readonly SESSION_KEY = 'bd_admin_auth';

  private _isLoggedIn = new BehaviorSubject<boolean>(
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem('bd_admin_auth') === '1'
  );
  isLoggedIn$ = this._isLoggedIn.asObservable();

  heroImageSrc$ = new BehaviorSubject<string>('italy_mountain.png');
  aboutText$ = new BehaviorSubject<string>(
    'Brīva diena ir ceļojumu aģentūra, kas piedāvā neatvairāmas ceļojuma pieredzes par pieņemamām cenām.'
  );
  trips$ = new BehaviorSubject<AdminTrip[]>([]);
  reviews$ = new BehaviorSubject<AdminReview[]>([]);

  get isLoggedIn(): boolean {
    return this._isLoggedIn.value;
  }

  login(username: string, password: string): boolean {
    if (username === 'admin' && password === 'admin') {
      sessionStorage.setItem(this.SESSION_KEY, '1');
      this._isLoggedIn.next(true);
      return true;
    }
    return false;
  }

  logout(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    this._isLoggedIn.next(false);
  }
}
