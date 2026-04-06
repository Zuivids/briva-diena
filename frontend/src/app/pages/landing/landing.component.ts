import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminStateService } from '../../shared/services/admin-state.service';

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

      <!-- Featured Trips Section -->
      <section class="featured-trips py-5">
        <div class="container">
          <h2 class="section-title mb-4">Pieejamie ceļojumi</h2>

          <ng-container *ngIf="(adminState.trips$ | async) as trips">
            <div *ngIf="trips.length > 0" class="row g-4 mb-4">
              <div *ngFor="let trip of trips" class="col-md-4">
                <div class="trip-card">
                  <div class="trip-card-body">
                    <h5 class="trip-title">{{ trip.title }}</h5>
                    <p class="trip-dest text-muted small mb-1">{{ trip.destination }}</p>
                    <p class="trip-dates small mb-2">{{ trip.dateRange }}</p>
                    <p *ngIf="trip.description" class="trip-desc small text-muted">{{ trip.description }}</p>
                    <div class="trip-footer">
                      <span class="trip-price">€{{ trip.price }}</span>
                      <a routerLink="/trips" class="btn btn-sm btn-register-sm">Pieteikties</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p *ngIf="trips.length === 0" class="text-muted">Šobrīd nav pieejamu ceļojumu.</p>
          </ng-container>

          <div class="text-center mt-2">
            <a routerLink="/trips" class="btn btn-primary btn-lg">Apskatīt visus</a>
          </div>
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

          <ng-container *ngIf="(adminState.reviews$ | async) as reviews">
            <div *ngIf="reviews.length > 0" class="row g-4 mb-4">
              <div *ngFor="let review of reviews" class="col-md-4">
                <div class="review-card">
                  <div class="review-stars mb-2">
                    <span *ngFor="let s of getStars(review.rating)" class="star">★</span>
                  </div>
                  <p class="review-text">"{{ review.text }}"</p>
                  <p class="review-name">— {{ review.name }}</p>
                </div>
              </div>
            </div>
            <p *ngIf="reviews.length === 0" class="text-muted">Šobrīd nav atsauksmju.</p>
          </ng-container>

          <div class="text-center mt-2">
            <a routerLink="/reviews" class="btn btn-outline-primary">Apskatīt vairāk atsauksmju</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-page {
      min-height: 100vh;
    }

    .hero-section {
      position: relative;
      width: 100%;
      overflow: hidden;
    }

    .hero-image {
      width: 100%;
      height: auto;
      max-height: 70vh;
      display: block;
      object-fit: cover;
    }

    .hero-text {
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      padding: 0 2rem;
    }

    .hero-text h1 {
      color: #fff;
      font-size: clamp(1.75rem, 4vw, 3.5rem);
      font-weight: 700;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
      margin: 0;
      line-height: 1.2;
    }

    .section-title {
      color: #1746a0;
      font-weight: 700;
    }

    /* Trip cards */
    .trip-card {
      border: 1px solid #e8ebf4;
      border-radius: 10px;
      overflow: hidden;
      height: 100%;
      background: #fff;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
      transition: transform 0.18s, box-shadow 0.18s;
    }

    .trip-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    }

    .trip-card-body {
      padding: 20px;
    }

    .trip-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .trip-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 12px;
    }

    .trip-price {
      font-size: 1.1rem;
      font-weight: 700;
      color: #e87722;
    }

    .btn-register-sm {
      background: #e87722;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
      padding: 4px 12px;
    }

    .btn-register-sm:hover {
      background: #cf6510;
      color: #fff;
    }

    .about-text {
      font-size: 1.05rem;
      line-height: 1.7;
      color: #444;
    }

    /* Review cards */
    .review-card {
      background: #fff;
      border: 1px solid #e8ebf4;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      height: 100%;
    }

    .star {
      color: #f5a623;
      font-size: 1rem;
    }

    .review-text {
      font-size: 0.9rem;
      color: #555;
      font-style: italic;
      line-height: 1.6;
    }

    .review-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0;
    }
  `]
})
export class LandingComponent {
  constructor(public adminState: AdminStateService) {}

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}
