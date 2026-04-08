import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminStateService } from '../../shared/services/admin-state.service';
import { TripService } from '../../shared/services/trip.service';
import { ReviewService } from '../../shared/services/review.service';
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
        <div class="hero-text">
          <h1>Piedzīvojumi, kas pilni ar atklājumiem</h1>
        </div>
      </section>

      <!-- TOP Trips Section -->
      <section class="featured-trips py-5">
        <div class="container">
          <h2 class="section-title mb-4">TOP ceļojumi</h2>

          <div *ngIf="topTrips.length > 0" class="row g-4 mb-4">
            <div *ngFor="let trip of topTrips" class="col-md-4">
              <div class="trip-card">
                <div class="trip-card-img" [style.backgroundImage]="coverMapTop[trip.id] ? 'url(http://localhost:8080/images/' + coverMapTop[trip.id] + ')' : 'none'" [class.no-cover]="!coverMapTop[trip.id]">
                  <span class="spots-badge">Brīvās vietas {{ trip.availableSpots }}</span>
                </div>
                <div class="trip-card-body">
                  <h5 class="trip-title">{{ trip.name }}</h5>
                  <p class="trip-dates small mb-2">
                    {{ trip.startDate | date:'dd.MM.yyyy' }} &ndash; {{ trip.endDate | date:'dd.MM.yyyy' }}
                  </p>
                  <p *ngIf="trip.description" class="trip-desc small text-muted">{{ trip.description }}</p>
                  <div class="trip-footer">
                    <span class="trip-price">&#8364;{{ (trip.priceCents / 100) | number:'1.0-0' }}</span>
                    <div class="trip-actions">
                      <a [routerLink]="['/trip', trip.id]" class="btn btn-sm btn-outline-secondary">Apskatīt</a>
                      <a [routerLink]="['/registration', trip.id]" class="btn btn-sm btn-register-sm">Pieteikties</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p *ngIf="topTrips.length === 0 && !topLoading" class="text-muted">Šobrīd nav izvēlētu TOP ceļojumu.</p>

          <div class="text-center mt-2">
            <a routerLink="/trips" class="btn btn-primary btn-lg">Apskatīt visus</a>
          </div>
        </div>
      </section>

      <!-- Last Chance Section -->
      <section class="last-chance-section py-5 bg-light">
        <div class="container">
          <h2 class="section-title mb-4">Pēdējā iespēja</h2>

          <div *ngIf="lastChanceTrips.length > 0" class="row g-4 mb-4">
            <div *ngFor="let trip of lastChanceTrips" class="col-md-4">
              <div class="trip-card">
                <div class="trip-card-img" [style.backgroundImage]="coverMapLastChance[trip.id] ? 'url(http://localhost:8080/images/' + coverMapLastChance[trip.id] + ')' : 'none'" [class.no-cover]="!coverMapLastChance[trip.id]">
                  <span class="spots-badge">Brīvās vietas {{ trip.availableSpots }}</span>
                </div>
                <div class="trip-card-body">
                  <h5 class="trip-title">{{ trip.name }}</h5>
                  <p class="trip-dates small mb-2">
                    {{ trip.startDate | date:'dd.MM.yyyy' }} &ndash; {{ trip.endDate | date:'dd.MM.yyyy' }}
                  </p>
                  <p *ngIf="trip.description" class="trip-desc small text-muted">{{ trip.description }}</p>
                  <div class="trip-footer">
                    <span class="trip-price">&#8364;{{ (trip.priceCents / 100) | number:'1.0-0' }}</span>
                    <div class="trip-actions">
                      <a [routerLink]="['/trip', trip.id]" class="btn btn-sm btn-outline-secondary">Apskatīt</a>
                      <a [routerLink]="['/registration', trip.id]" class="btn btn-sm btn-register-sm">Pieteikties</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p *ngIf="lastChanceTrips.length === 0 && !lastChanceLoading" class="text-muted">Šobrīd nav pēdējās iespējas ceļojumu.</p>
        </div>
      </section>

      <!-- About Section -->
      <section class="about-section py-5 bg-light">
        <div class="container">
          <h2 class="section-title">Kas ir Brīva diena?</h2>
          <p class="about-text">{{ adminState.aboutText$ | async }}</p>
        </div>
      </section>

      <!-- Reviews Section -->
      <section class="reviews-section py-5">
        <div class="container">
          <h2 class="section-title">Atsauksmes</h2>

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
    .hero-image { width: 100%; height: auto; max-height: 70vh; display: block; object-fit: cover; }
    .hero-text { position: absolute; top: 50%; left: 0; transform: translateY(-50%); padding: 0 2rem; }
    .hero-text h1 {
      color: #fff; font-size: clamp(1.75rem, 4vw, 3.5rem); font-weight: 700;
      text-shadow: 0 2px 12px rgba(0,0,0,0.45); margin: 0; line-height: 1.2;
    }

    .section-title { color: #1746a0; font-weight: 700; }

    .trip-card {
      border: 1px solid #e8ebf4; border-radius: 10px; height: 100%;
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
    .trip-card-body { padding: 20px; }
    .trip-title { font-size: 1rem; font-weight: 600; margin-bottom: 4px; }
    .trip-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
    .trip-price { font-size: 1.1rem; font-weight: 700; color: #e87722; }
    .trip-actions { display: flex; gap: 6px; }
    .btn-register-sm {
      background: #e87722; color: #fff; border: none;
      border-radius: 6px; font-size: 0.8rem; font-weight: 500; padding: 4px 12px;
    }
    .btn-register-sm:hover { background: #cf6510; color: #fff; }

    .about-text { font-size: 1.05rem; line-height: 1.7; color: #444; }

    .review-card {
      background: #fff; border: 1px solid #e8ebf4; border-radius: 10px;
      padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); height: 100%;
    }
    .star { color: #f5a623; font-size: 1rem; }
    .review-text { font-size: 0.9rem; color: #555; font-style: italic; line-height: 1.6; }
    .review-name { font-size: 0.875rem; font-weight: 600; color: #333; margin-bottom: 0; }
  `]
})
export class LandingComponent implements OnInit {
  topTrips: Trip[] = [];
  lastChanceTrips: Trip[] = [];
  reviews: Review[] = [];
  coverMapTop: Record<string, string> = {};
  coverMapLastChance: Record<string, string> = {};
  topLoading = true;
  lastChanceLoading = true;
  reviewsLoading = true;

  constructor(
    public adminState: AdminStateService,
    private tripService: TripService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.loadSection('TOP');
    this.loadSection('LAST_CHANCE');
    this.reviewService.getLatestReviews(3).subscribe({
      next: (data) => { this.reviews = data; this.reviewsLoading = false; },
      error: () => { this.reviewsLoading = false; }
    });
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

