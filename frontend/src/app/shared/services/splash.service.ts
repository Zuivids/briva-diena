import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, combineLatest, timer } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SplashService {
  visible$ = new BehaviorSubject<boolean>(false);
  private readySubject = new Subject<void>();

  markReady(): void {
    this.readySubject.next();
  }

  show(): void {
    // Fresh ready signal for each show
    this.readySubject = new Subject<void>();
    this.visible$.next(true);

    // Hide when BOTH min 500ms passed AND content is ready
    combineLatest([this.readySubject.pipe(take(1)), timer(500)])
      .pipe(take(1))
      .subscribe(() => this.visible$.next(false));

    // Hard fallback — never block longer than 3s
    timer(3000).pipe(take(1))
      .subscribe(() => { if (this.visible$.value) this.visible$.next(false); });
  }
}
