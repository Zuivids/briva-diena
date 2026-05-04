import { Component, OnInit, AfterViewInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminStateService } from '../../shared/services/admin-state.service';
import { TripService } from '../../shared/services/trip.service';
import { ReviewService } from '../../shared/services/review.service';
import { InstagramService } from '../../shared/services/instagram.service';
import { HeroImageService } from '../../shared/services/hero-image.service';
import { SiteContentService } from '../../shared/services/site-content.service';
import { Trip } from '../../shared/models/trip.model';
import { Review } from '../../shared/models/review.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-page">

      <!-- Hero Section -->
      <section class="hero-section">
        <img [src]="(adminState.heroImageSrc$ | async) || 'italy_mountain.png'" alt="Italy mountain" class="hero-image" />
        <div class="hero-text" [ngClass]="heroAnimClass">
          <h1>{{ currentHeroText }}</h1>
        </div>
      </section>

      <!-- TOP Trips Section -->
      <section class="featured-trips py-5">
        <div class="container">
          <h2 class="section-title mb-4">GAIDĀMIE CEĻOJUMI</h2>

          <div *ngIf="topTrips.length > 0" class="row g-4 mb-4">
            <div *ngFor="let trip of topTrips" class="col-md-4">
              <a [routerLink]="['/trip', trip.id]" class="trip-card-link">
              <div class="trip-card">
                <div class="trip-card-img" [style.backgroundImage]="coverMapTop[trip.id] ? 'url(/images/' + coverMapTop[trip.id] + ')' : 'none'" [class.no-cover]="!coverMapTop[trip.id]">
                  <div *ngIf="trip.availableSpots === 0" class="soldout-overlay">Izpārdots</div>
                </div>
                <div class="trip-card-body">
                  <h5 class="trip-title">{{ trip.name }}</h5>
                  <p class="trip-dates small mb-2">
                    {{ trip.startDate | date:'dd.MM.yyyy' }} &ndash; {{ trip.endDate | date:'dd.MM.yyyy' }} 
                  </p>
                  <p class="trip-spots small mb-2">Brīvās vietas: <strong>{{ trip.availableSpots }}</strong></p>
                  <div class="trip-footer">
                    <span class="trip-price">&#8364;{{ (trip.priceCents / 100) | number:'1.0-0' }}</span>
                    <div class="trip-actions">
                      <a [routerLink]="['/trip', trip.id]" class="btn btn-sm btn-outline-secondary" (click)="$event.stopPropagation()">Apskatīt</a>
                      <a [routerLink]="['/registration', trip.id]" class="btn btn-sm btn-register-sm" (click)="$event.stopPropagation()">Pieteikties</a>
                    </div>
                  </div>
                </div>
              </div>
              </a>
            </div>
          </div>
          <p *ngIf="topTrips.length === 0 && !topLoading" class="text-muted">Šobrīd nav izvēlētu "Gaidāmie ceļojumi".</p>

          <div class="text-center mt-2">
            <a routerLink="/trips" class="btn btn-primary btn-lg">Apskatīt visus</a>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section class="about-section py-5 bg-light">
        <div class="container">
          <h2 class="section-title">KAS IR BRĪVA DIENA?</h2>
          <p class="about-text">{{ adminState.aboutText$ | async }}</p>
        </div>
      </section>

      <!-- Last Chance Section -->
      <section *ngIf="lastChanceTrips.length > 0" class="last-chance-section py-5">
        <div class="container">
          <h2 class="section-title mb-4">PĒDĒJĀ IESPĒJA</h2>

          <div class="row g-4 mb-4">
            <div *ngFor="let trip of lastChanceTrips" class="col-md-4">
              <a [routerLink]="['/trip', trip.id]" class="trip-card-link">
              <div class="trip-card">
                <div class="trip-card-img" [style.backgroundImage]="coverMapLastChance[trip.id] ? 'url(/images/' + coverMapLastChance[trip.id] + ')' : 'none'" [class.no-cover]="!coverMapLastChance[trip.id]">
                  <div *ngIf="trip.availableSpots === 0" class="soldout-overlay">Izpārdots</div>
                </div>
                <div class="trip-card-body">
                  <h5 class="trip-title">{{ trip.name }}</h5>
                  <p class="trip-dates small mb-2">
                    {{ trip.startDate | date:'dd.MM.yyyy' }} &ndash; {{ trip.endDate | date:'dd.MM.yyyy' }}
                  </p>
                  <p class="trip-spots small mb-2">Brīvās vietas: <strong>{{ trip.availableSpots }}</strong></p>
                  <p *ngIf="trip.description" class="trip-desc small text-muted">{{ trip.description }}</p>
                  <div class="trip-footer">
                    <span class="trip-price">&#8364;{{ (trip.priceCents / 100) | number:'1.0-0' }}</span>
                    <div class="trip-actions">
                      <a [routerLink]="['/trip', trip.id]" class="btn btn-sm btn-outline-secondary" (click)="$event.stopPropagation()">Apskatīt</a>
                      <a [routerLink]="['/registration', trip.id]" class="btn btn-sm btn-register-sm" (click)="$event.stopPropagation()">Pieteikties</a>
                    </div>
                  </div>
                </div>
              </div>
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Instagram Section -->
      <section *ngIf="instagramUrls.length > 0" class="instagram-section py-5 bg-light">
        <div class="container">
          <h2 class="section-title mb-4">IESKATIES</h2>
          <div class="instagram-scroll">
            <div *ngFor="let url of instagramUrls" class="instagram-item">
              <blockquote
                class="instagram-media"
                [attr.data-instgrm-permalink]="url"
                data-instgrm-version="14"
                style="background:#FFF;border:0;border-radius:3px;box-shadow:0 0 1px 0 rgba(0,0,0,.5),0 1px 10px 0 rgba(0,0,0,.15);margin:0;max-width:320px;min-width:280px;padding:0;width:100%;">
              </blockquote>
            </div>
          </div>
          <div class="text-center mt-4">
            <a href="https://www.instagram.com/briva.diena/" target="_blank" rel="noopener noreferrer" class="btn btn-outline-dark">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="me-2" style="vertical-align:-2px">
                <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm.003 1.44c2.136 0 2.389.009 3.233.048.778.036 1.203.166 1.485.276.373.145.64.319.92.599s.453.546.598.92c.11.281.24.706.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.778-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.706.241-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.778-.036-1.203-.166-1.484-.276a2.47 2.47 0 0 1-.92-.598 2.47 2.47 0 0 1-.6-.92c-.109-.281-.24-.706-.275-1.485C1.449 10.39 1.44 10.136 1.44 8s.009-2.389.047-3.232c.036-.778.166-1.203.276-1.485.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.706-.24 1.485-.276.842-.038 1.096-.047 3.232-.047z"/>
                <path d="M8 3.892a4.108 4.108 0 1 0 0 8.216 4.108 4.108 0 0 0 0-8.216zm0 6.775a2.667 2.667 0 1 1 0-5.334 2.667 2.667 0 0 1 0 5.334zm5.23-6.937a.96.96 0 1 1-1.92 0 .96.96 0 0 1 1.92 0z"/>
              </svg>
              Pieseko!
            </a>
          </div>
        </div>
      </section>

      <!-- Reviews Section -->
      <section class="reviews-section py-5">
        <div class="container">
          <h2 class="section-title">ATSAUKSMES</h2>

          <div *ngIf="reviews.length > 0" class="row g-4 mb-4">
            <div *ngFor="let review of reviews" class="col-md-4">
              <div class="review-card">
                <div class="review-stars mb-2">
                  <span *ngFor="let s of getStars(review.rating)" class="star">&#9733;</span>
                </div>
                <p class="review-text">"{{ review.reviewText }}"</p>
                <p class="review-name">&#8212; {{ review.customerName }}</p>
              </div>
            </div>
          </div>
          <p *ngIf="reviews.length === 0 && !reviewsLoading" class="text-muted">Šobrīd nav atsauksmju.</p>

          <div class="text-center mt-2">
            <a routerLink="/reviews" class="btn btn-outline-primary">Apskatīt vairāk atsauksmju</a>
          </div>
        </div>
      </section>

    </div>


  `,
  styles: [`
    .landing-page { min-height: 100vh; }

    .hero-section { position: relative; width: 100%; overflow: hidden; }
    .hero-image { width: 100%; height: auto; max-height: 40vh; display: block; object-fit: cover; }
    .hero-text {
      position: absolute; top: 50%; left: 0; padding: 0 2rem;
      transform: translateY(-50%) translateX(0);
      transition: transform 0.35s ease-out;
    }
    .hero-text.slide-out {
      transform: translateY(-50%) translateX(110%);
      transition: transform 0.25s ease-in;
    }
    .hero-text.slide-in-start {
      transform: translateY(-50%) translateX(-110%);
      transition: none;
    }
    .hero-text h1 {
      color: #fff; font-size: clamp(1.75rem, 4vw, 3.5rem); font-weight: 700;
      text-shadow: 0 2px 12px rgba(0,0,0,0.45); margin: 0; line-height: 1.2;
    }

    .section-title { color: #5C4033;text-align: center; font-weight: 700; }

    .trip-card-link {
      display: block;
      text-decoration: none;
      color: inherit;
      height: 100%;
    }
    .trip-card-link:hover { color: inherit; }

    .trip-card {
      border: 1px solid #e8ebf4; border-radius: 0; height: 100%;
      background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      transition: transform 0.18s, box-shadow 0.18s;
      overflow: hidden;
    }
    .trip-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
    .trip-card-img {
      width: 100%;
      height: 170px;
      background-size: cover;
      background-position: center;
      background-color: #e8eef8;
      position: relative;
    }
    .spots-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.55);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 20px;
      backdrop-filter: blur(4px);
      letter-spacing: 0.01em;
    }
    .trip-card-img.no-cover {
      background-image: linear-gradient(135deg, #c8d6f0 0%, #e8eef8 100%);
    }
    .soldout-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.3rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .trip-card-body { padding: 20px; }
    .trip-title { font-size: 2rem; font-weight: 600; margin-bottom: 4px; }
    .trip-dates { color: #666; }
    .trip-spots { color: #666; margin-bottom: 8px !important; }
    .trip-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
    .trip-price { font-size: 2rem; font-weight: 700; color: #e87722; }
    .trip-actions { display: flex; gap: 6px; }
    .btn-register-sm {
      background: #e87722; color: #fff; border: none;
      border-radius: 6px; font-size: 0.8rem; font-weight: 500; padding: 4px 12px;
    }
    .btn-register-sm:hover { background: #cf6510; color: #fff; }

    .about-text { font-size: 1.05rem; line-height: 1.7; color: #444; }

    .review-card {
      background: #fff; border: 1px solid #e8ebf4;
      padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); height: 100%;
    }
    .star { color: #f5a623; font-size: 1rem; }
    .review-text { font-size: 0.9rem; color: #555; font-style: italic; line-height: 1.6; }
    .review-name { font-size: 0.875rem; font-weight: 600; color: #333; margin-bottom: 0; }

    .instagram-scroll {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      padding-bottom: 12px;
      scroll-snap-type: x mandatory;
    }
    .instagram-scroll::-webkit-scrollbar { height: 4px; }
    .instagram-scroll::-webkit-scrollbar-thumb { background: #c0c8e0; border-radius: 4px; }

    .instagram-item {
      flex-shrink: 0;
      width: 320px;
      scroll-snap-align: start;
    }

  `]
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  heroTexts: string[] = [
    'DODIES NEAIZMIRSTAMĀ CEĻOJUMĀ',
    'CEĻOJUMS: ATMIŅAS, KAS PALIEK UZ MŪŽU',
    'ATMIŅAS, KAS PALIEK UZ MŪŽU'
  ];
  heroTextIndex = 0;
  heroAnimClass = '';
  private heroInterval: ReturnType<typeof setInterval> | null = null;

  get currentHeroText(): string { return this.heroTexts[this.heroTextIndex]; }

  topTrips: Trip[] = [];
  lastChanceTrips: Trip[] = [];
  reviews: Review[] = [];
  coverMapTop: Record<string, string> = {};
  coverMapLastChance: Record<string, string> = {};
  topLoading = true;
  lastChanceLoading = true;
  reviewsLoading = true;
  instagramUrls: string[] = [];

  constructor(
    public adminState: AdminStateService,
    private tripService: TripService,
    private reviewService: ReviewService,
    private instagramService: InstagramService,
    private heroImageService: HeroImageService,
    private siteContentService: SiteContentService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.heroImageService.getHeroImage().subscribe({
      next: (res) => {
        if (res.path) {
          this.adminState.heroImageSrc$.next('/images/' + res.path);
        }
      },
      error: () => {}
    });
    this.siteContentService.get('about_text').subscribe({
      next: (res) => { this.adminState.aboutText$.next(res.value); },
      error: () => {}
    });
    this.loadSection('TOP');
    this.loadSection('LAST_CHANCE');
    this.reviewService.getLatestReviews(3).subscribe({
      next: (data) => { this.reviews = data; this.reviewsLoading = false; },
      error: () => { this.reviewsLoading = false; }
    });
    this.adminState.instagramPostUrls$.subscribe(urls => {
      this.instagramUrls = urls;
      setTimeout(() => this.processInstagramEmbeds(), 200);
    });
    this.instagramService.getAll().subscribe({
      next: (posts) => {
        const urls = posts.map(p => p.url);
        this.adminState.instagramPostUrls$.next(urls);
      },
      error: () => {}
    });
    this.heroInterval = setInterval(() => this.advanceHeroText(), 5000);
  }

  ngOnDestroy(): void {
    if (this.heroInterval) clearInterval(this.heroInterval);
  }

  private advanceHeroText(): void {
    this.heroAnimClass = 'slide-out';
    setTimeout(() => {
      this.heroTextIndex = (this.heroTextIndex + 1) % this.heroTexts.length;
      this.heroAnimClass = 'slide-in-start';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { this.heroAnimClass = ''; });
      });
    }, 250);
  }

  ngAfterViewInit(): void {
    this.processInstagramEmbeds();
  }

  private processInstagramEmbeds(): void {
    if (this.instagramUrls.length === 0) return;
    const win = window as any;
    if (win.instgrm) {
      win.instgrm.Embeds.process();
    } else if (!this.document.getElementById('instagram-embed-js')) {
      const script = this.document.createElement('script');
      script.id = 'instagram-embed-js';
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      this.document.body.appendChild(script);
    }
  }

  private loadSection(section: 'TOP' | 'LAST_CHANCE'): void {
    this.tripService.getLandingTrips(section).subscribe({
      next: (trips) => {
        if (section === 'TOP') {
          this.topTrips = trips;
          this.topLoading = false;
        } else {
          this.lastChanceTrips = trips;
          this.lastChanceLoading = false;
        }
        if (trips.length === 0) return;
        const coverRequests = trips.map(t =>
          this.tripService.getCoverImage(t.id).pipe(catchError(() => of(null)))
        );
        forkJoin(coverRequests).subscribe(results => {
          results.forEach((r, i) => {
            if (r) {
              if (section === 'TOP') this.coverMapTop[trips[i].id] = r.path;
              else this.coverMapLastChance[trips[i].id] = r.path;
            }
          });
        });
      },
      error: () => {
        if (section === 'TOP') this.topLoading = false;
        else this.lastChanceLoading = false;
      }
    });
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}

