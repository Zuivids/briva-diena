import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { combineLatest, timer } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SplashService } from './shared/services/splash.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
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
    private splashService: SplashService
  ) {}

  ngOnInit(): void {
    // Hide splash when both min delay has passed AND content is ready
    combineLatest([timer(500), this.splashService.ready$]).pipe(take(1))
      .subscribe(() => this.hideSplash());

    // Hard fallback — always hide after 5s regardless
    timer(5000).pipe(take(1)).subscribe(() => this.hideSplash());

    // For non-landing routes, signal ready as soon as navigation completes
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url: string = e.urlAfterRedirects || e.url;
      if (url !== '/') {
        this.splashService.markReady();
      }
    });
  }

  private hideSplash(): void {
    const splash = this.document.getElementById('app-splash');
    if (splash && !splash.classList.contains('fade-out')) {
      splash.classList.add('fade-out');
      setTimeout(() => splash.remove(), 400);
    }
  }
}

