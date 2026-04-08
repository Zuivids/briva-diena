import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminStateService } from '../../shared/services/admin-state.service';
import { TripService } from '../../shared/services/trip.service';
import { ReviewService } from '../../shared/services/review.service';
import { Trip } from '../../shared/models/trip.model';
import { Review } from '../../shared/models/review.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-panel">

      <!-- Panel header -->
      <div class="panel-header">
        <span class="panel-title">Admin panelis — Brīva diena</span>
        <button class="btn btn-sm btn-outline-light" (click)="logout()">Izrakstīties</button>
      </div>

      <div class="container py-4">

        <!-- ── Hero Image ── -->
        <section class="admin-section">
          <h4 class="section-heading">Galvenās lapas attēls</h4>
          <div class="hero-row">
            <img [src]="heroPreview" alt="Hero preview" class="hero-thumb" />
            <div class="ms-3">
              <label class="btn btn-outline-primary btn-sm upload-btn" for="heroFile">
                Mainīt attēlu
                <input
                  id="heroFile"
                  type="file"
                  accept="image/*"
                  class="visually-hidden"
                  (change)="onHeroUpload($event)"
                />
              </label>
              <p class="hint mt-2">Ieteicamais izmērs: 1600 × 900 px</p>
            </div>
          </div>
        </section>

        <hr class="section-divider" />

        <!-- ── Trips ── -->
        <section class="admin-section">
          <h4 class="section-heading">Pieejamie ceļojumi</h4>

          <div class="items-list mb-3">
            <div *ngFor="let trip of trips" class="list-item">
              <div class="list-item-info">
                <strong>{{ trip.name }}</strong>
                <span class="badge bg-secondary ms-2">{{ trip.startDate | date:'dd.MM.yyyy' }} &ndash; {{ trip.endDate | date:'dd.MM.yyyy' }}</span>
                <span class="badge bg-primary ms-2">&#8364;{{ (trip.priceCents / 100) | number:'1.0-0' }}</span>
              </div>
              <button class="btn btn-sm btn-outline-danger" (click)="removeTrip(trip.id)">Dzēst</button>
            </div>
            <p *ngIf="trips.length === 0" class="text-muted small mb-0">Nav pievienotu ceļojumu.</p>
          </div>

          <div class="add-form">
            <p class="add-form-label">Pievienot ceļojumu</p>
            <div class="row g-2">
              <div class="col-md-6">
                <input type="text" [(ngModel)]="newTripName" name="tName"
                  class="form-control form-control-sm" placeholder="Nosaukums" />
              </div>
              <div class="col-md-3">
                <input type="date" [(ngModel)]="newTripStartDate" name="tStart"
                  class="form-control form-control-sm" />
              </div>
              <div class="col-md-3">
                <input type="date" [(ngModel)]="newTripEndDate" name="tEnd"
                  class="form-control form-control-sm" />
              </div>
              <div class="col-md-4">
                <input type="number" [(ngModel)]="newTripPriceEur" name="tPrice"
                  class="form-control form-control-sm" placeholder="Cena (€)" min="0" />
              </div>
              <div class="col-md-4">
                <input type="number" [(ngModel)]="newTripSpots" name="tSpots"
                  class="form-control form-control-sm" placeholder="Brīvās vietas" min="0" />
              </div>
              <div class="col-md-4 d-flex align-items-end">
                <button class="btn btn-primary btn-sm w-100" (click)="addTrip()">Pievienot</button>
              </div>
              <div class="col-12">
                <textarea [(ngModel)]="newTripDesc" name="tDesc"
                  class="form-control form-control-sm" rows="2"
                  placeholder="Īss apraksts"></textarea>
              </div>
              <div *ngIf="tripError" class="col-12">
                <span class="text-danger small">{{ tripError }}</span>
              </div>
            </div>
          </div>
        </section>

        <hr class="section-divider" />

        <!-- ── About ── -->
        <section class="admin-section">
          <h4 class="section-heading">Kas ir Brīva diena?</h4>
          <textarea [(ngModel)]="aboutText" name="aboutText"
            class="form-control" rows="5"></textarea>
          <div class="mt-2 d-flex align-items-center gap-2">
            <button class="btn btn-primary btn-sm" (click)="saveAbout()">Saglabāt</button>
            <span *ngIf="aboutSaved" class="text-success small">Saglabāts!</span>
          </div>
        </section>

        <hr class="section-divider" />

        <!-- ── Reviews ── -->
        <section class="admin-section">
          <h4 class="section-heading">Atsauksmes</h4>

          <div class="items-list mb-3">
            <div *ngFor="let review of reviews" class="list-item">
              <div class="list-item-info">
                <strong>{{ review.customerName }}</strong>
                <span class="ms-2 text-muted small">
                  {{ review.reviewText.length > 90 ? (review.reviewText | slice:0:90) + '...' : review.reviewText }}
                </span>
                <span class="ms-2">
                  <span *ngFor="let s of getStars(review.rating)" class="star">★</span>
                </span>
              </div>
              <button class="btn btn-sm btn-outline-danger" (click)="removeReview(review.id)">Dzēst</button>
            </div>
            <p *ngIf="reviews.length === 0" class="text-muted small mb-0">Nav pievienotu atsauksmju.</p>
          </div>

          <div class="add-form">
            <p class="add-form-label">Pievienot atsauksmi</p>
            <div class="row g-2">
              <div class="col-md-5">
                <input type="text" [(ngModel)]="newReviewName" name="rName"
                  class="form-control form-control-sm" placeholder="Vārds" />
              </div>
              <div class="col-md-3">
                <select [(ngModel)]="newReviewRating" name="rRating"
                  class="form-select form-select-sm">
                  <option [value]="5">5 ★</option>
                  <option [value]="4">4 ★</option>
                  <option [value]="3">3 ★</option>
                  <option [value]="2">2 ★</option>
                  <option [value]="1">1 ★</option>
                </select>
              </div>
              <div class="col-12">
                <textarea [(ngModel)]="newReviewText" name="rText"
                  class="form-control form-control-sm" rows="2"
                  placeholder="Atsauksmes teksts"></textarea>
              </div>
              <div class="col-md-3">
                <button class="btn btn-primary btn-sm" (click)="addReview()">Pievienot</button>
              </div>
              <div *ngIf="reviewError" class="col-12">
                <span class="text-danger small">{{ reviewError }}</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  `,
  styles: [`
    .admin-panel {
      min-height: 100vh;
      background: #f4f6fb;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #1746a0;
      color: #fff;
      padding: 14px 24px;
      font-weight: 600;
      font-size: 1rem;
      position: sticky;
      top: 72px;
      z-index: 100;
    }

    .admin-section {
      background: #fff;
      border-radius: 10px;
      padding: 24px;
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.07);
    }

    .section-heading {
      font-size: 1rem;
      font-weight: 600;
      color: #1746a0;
      margin-bottom: 16px;
    }

    .section-divider {
      border-color: #e0e4ef;
      margin: 24px 0;
    }

    /* Hero */
    .hero-row {
      display: flex;
      align-items: center;
    }

    .hero-thumb {
      width: 200px;
      height: 112px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #dee2e6;
    }

    .upload-btn {
      cursor: pointer;
    }

    .hint {
      font-size: 0.78rem;
      color: #999;
      margin: 0;
    }

    /* List items */
    .items-list {
      border: 1px solid #e8ebf4;
      border-radius: 8px;
      overflow: hidden;
    }

    .list-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-bottom: 1px solid #f0f2f8;
      background: #fff;
    }

    .list-item:last-child {
      border-bottom: none;
    }

    .list-item-info {
      flex: 1;
      min-width: 0;
    }

    .add-form {
      background: #f8f9fd;
      border: 1px solid #e8ebf4;
      border-radius: 8px;
      padding: 16px;
    }

    .add-form-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #444;
      margin-bottom: 10px;
    }

    .star {
      color: #f5a623;
      font-size: 0.85rem;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  trips: Trip[] = [];
  reviews: Review[] = [];
  aboutText = '';
  aboutSaved = false;
  heroPreview = 'italy_mountain.png';

  // Trip form
  newTripName = '';
  newTripStartDate = '';
  newTripEndDate = '';
  newTripPriceEur = 0;
  newTripSpots = 0;
  newTripDesc = '';
  tripError = '';

  // Review form
  newReviewName = '';
  newReviewText = '';
  newReviewRating = 5;
  reviewError = '';

  constructor(
    public adminState: AdminStateService,
    private tripService: TripService,
    private reviewService: ReviewService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.heroPreview = this.adminState.heroImageSrc$.value;
    this.aboutText = this.adminState.aboutText$.value;
    this.loadTrips();
    this.loadReviews();
  }

  loadTrips(): void {
    this.tripService.getAllTrips().subscribe({
      next: (data) => this.trips = data,
      error: () => this.tripError = 'Neizdevās ielādēt ceļojumus.'
    });
  }

  loadReviews(): void {
    this.reviewService.getAllReviews().subscribe({
      next: (data) => this.reviews = data,
      error: () => this.reviewError = 'Neizdevās ielādēt atsauksmes.'
    });
  }

  onHeroUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target!.result as string;
      this.heroPreview = src;
      this.adminState.heroImageSrc$.next(src);
    };
    reader.readAsDataURL(file);
  }

  addTrip(): void {
    this.tripError = '';
    if (!this.newTripName.trim() || !this.newTripStartDate || !this.newTripEndDate) {
      this.tripError = 'Nosaukums un datumi ir obligāti.';
      return;
    }
    const trip: Partial<Trip> = {
      name: this.newTripName,
      description: this.newTripDesc,
      startDate: this.newTripStartDate,
      endDate: this.newTripEndDate,
      priceCents: Math.round(this.newTripPriceEur * 100),
      currency: 'EUR',
      availableSpots: this.newTripSpots
    };
    this.tripService.createTrip(trip as Trip).subscribe({
      next: () => {
        this.newTripName = '';
        this.newTripDesc = '';
        this.newTripStartDate = '';
        this.newTripEndDate = '';
        this.newTripPriceEur = 0;
        this.newTripSpots = 0;
        this.loadTrips();
      },
      error: () => this.tripError = 'Neizdevās pievienot ceļojumu.'
    });
  }

  removeTrip(id: string): void {
    this.tripService.deleteTrip(id).subscribe({
      next: () => this.loadTrips(),
      error: () => this.tripError = 'Neizdevās dzēst ceļojumu.'
    });
  }

  saveAbout(): void {
    this.adminState.aboutText$.next(this.aboutText);
    this.aboutSaved = true;
    setTimeout(() => (this.aboutSaved = false), 2000);
  }

  addReview(): void {
    this.reviewError = '';
    if (!this.newReviewName.trim() || !this.newReviewText.trim()) {
      this.reviewError = 'Vārds un teksts ir obligāti.';
      return;
    }
    const review: Omit<Review, 'id' | 'createdAt'> = {
      customerName: this.newReviewName,
      reviewText: this.newReviewText,
      rating: this.newReviewRating
    };
    this.reviewService.createReview(review).subscribe({
      next: () => {
        this.newReviewName = '';
        this.newReviewText = '';
        this.newReviewRating = 5;
        this.loadReviews();
      },
      error: () => this.reviewError = 'Neizdevās pievienot atsauksmi.'
    });
  }

  removeReview(id: string): void {
    this.reviewService.deleteReview(id).subscribe({
      next: () => this.loadReviews(),
      error: () => this.reviewError = 'Neizdevās dzēst atsauksmi.'
    });
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  logout(): void {
    this.adminState.logout();
    this.router.navigate(['/admin/login']);
  }
}
