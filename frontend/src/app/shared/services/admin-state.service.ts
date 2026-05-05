import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

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

  constructor(private authService: AuthService) {
    // Keep isLoggedIn$ in sync with the JWT-based AuthService
    this.authService.isAuthenticated$.subscribe(val => this._isLoggedIn.next(val));
  }

  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn.asObservable();

  heroImageSrc$ = new BehaviorSubject<string | null>(null);
  aboutText$ = new BehaviorSubject<string>(
    'Brīva diena ir ceļojumu aģentūra, kas piedāvā neatvairāmas ceļojuma pieredzes par pieņemamām cenām.'
  );
  aboutPageContent$ = new BehaviorSubject<string>(
    'Brīva diena ir ceļojumu aģentūra, kas dibināta ar mērķi piedāvāt augstas kvalitātes grupu ceļojumus par pieejamām cenām.\n\nMēs specializējamies organizētu ceļojumu piedāvāšanā uz Eiropas skaistākajām vietām. Katrs ceļojums ir rūpīgi plānots, lai nodrošinātu neaizmirstamu pieredzi.\n\nMūsu komanda ir gatava atbildēt uz visiem jūsu jautājumiem un palīdzēt izvēlēties ideālo ceļojumu tieši jums.'
  );
  aboutPageImage$ = new BehaviorSubject<string | null>(null);
  faqItems$ = new BehaviorSubject<{ id: string; question: string; answer: string }[]>([]);
  instagramPostUrls$ = new BehaviorSubject<string[]>([]);
  trips$ = new BehaviorSubject<AdminTrip[]>([]);
  reviews$ = new BehaviorSubject<AdminReview[]>([]);

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
  }
}
