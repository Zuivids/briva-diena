import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT, AsyncPipe } from '@angular/common';
import { Router, NavigationStart, RouterOutlet } from '@angular/router';
import { filter, skip, take } from 'rxjs/operators';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SplashService } from './shared/services/splash.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, AsyncPipe],
  template: `
    <div class="ng-splash" [class.visible]="splashService.visible$ | async">
      <div class="splash-logo">Brīva Diena</div>
      <div class="splash-spinner"></div>
    </div>
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    public splashService: SplashService
  ) {}

  private isSplashRoute(url: string): boolean {
    return url === '/' || url === '/trips' || url.startsWith('/trips?') || url.startsWith('/trips/');
  }

  ngOnInit(): void {
    // Initial navigation: sync with index.html splash
    this.router.events.pipe(
      filter(e => e instanceof NavigationStart),
      take(1)
    ).subscribe((e: any) => {
      if (this.isSplashRoute(e.url)) {
        this.splashService.show();
        // Small delay so Angular splash is rendered before removing index.html splash
        setTimeout(() => this.removeStaticSplash(), 50);
      } else {
        this.removeStaticSplash();
      }
    });

    // Subsequent navigations
    this.router.events.pipe(
      filter(e => e instanceof NavigationStart),
      skip(1)
    ).subscribe((e: any) => {
      if (this.isSplashRoute(e.url)) {
        this.splashService.show();
      } else {
        this.splashService.visible$.next(false);
      }
    });
  }

  private removeStaticSplash(): void {
    const splash = this.document.getElementById('app-splash');
    if (splash) {
      splash.classList.add('fade-out');
      setTimeout(() => splash.remove(), 400);
    }
  }
}


