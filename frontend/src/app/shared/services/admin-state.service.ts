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
  aboutPageContent$ = new BehaviorSubject<string>(
    'Brīva diena ir ceļojumu aģentūra, kas dibināta ar mērķi piedāvāt augstas kvalitātes grupu ceļojumus par pieejamām cenām.\n\nMēs specializējamies organizētu ceļojumu piedāvāšanā uz Eiropas skaistākajām vietām. Katrs ceļojums ir rūpīgi plānots, lai nodrošinātu neaizmirstamu pieredzi.\n\nMūsu komanda ir gatava atbildēt uz visiem jūsu jautājumiem un palīdzēt izvēlēties ideālo ceļojumu tieši jums.'
  );
  aboutPageImage$ = new BehaviorSubject<string | null>(null);
  faqItems$ = new BehaviorSubject<{ id: string; question: string; answer: string }[]>([
    { id: '1', question: 'Kā es varu pieteikties ceļojumam?', answer: 'Varat pieteikties tiešsaistē, aizpildot reģistrācijas formu pie katra ceļojuma lapā.' },
    { id: '2', question: 'Vai ir iespējama avansa maksājuma atlikšana?', answer: 'Jā, mums ir pieejami dažādi maksājumu plāni. Sazinieties ar mums, lai uzzinātu vairāk.' },
    { id: '3', question: 'Kādi dokumenti man nepieciešami ceļojumam?', answer: 'Lielākajai daļai Eiropas ceļojumu nepieciešama derīga pase vai personas apliecība. Konkrētas prasības atrodamas pie katra ceļojuma apraksta.' },
  ]);
  instagramPostUrls$ = new BehaviorSubject<string[]>([]);
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
