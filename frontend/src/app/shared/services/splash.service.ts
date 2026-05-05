import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SplashService {
  private readySubject = new ReplaySubject<void>(1);
  ready$ = this.readySubject.asObservable();

  markReady(): void {
    this.readySubject.next();
  }
}
