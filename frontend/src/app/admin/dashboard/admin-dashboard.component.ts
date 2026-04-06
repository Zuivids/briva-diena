import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminStateService, AdminTrip, AdminReview } from '../../shared/services/admin-state.service';

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
                <strong>{{ trip.title }}</strong>
                <span class="text-muted ms-2 small">{{ trip.destination }}</span>
                <span class="badge bg-secondary ms-2">{{ trip.dateRange }}</span>
                <span class="badge bg-primary ms-2">€{{ trip.price }}</span>
              </div>
              <button class="btn btn-sm btn-outline-danger" (click)="removeTrip(trip.id)">Dzēst</button>
            </div>
            <p *ngIf="trips.length === 0" class="text-muted small mb-0">Nav pievienotu ceļojumu.</p>
          </div>

          <div class="add-form">
            <p class="add-form-label">Pievienot ceļojumu</p>
            <div class="row g-2">
              <div class="col-md-6">
                <input type="text" [(ngModel)]="newTrip.title" name="tTitle"
                  class="form-control form-control-sm" placeholder="Nosaukums" />
              </div>
              <div class="col-md-6">
                <input type="text" [(ngModel)]="newTrip.destination" name="tDest"
                  class="form-control form-control-sm" placeholder="Galamērķis" />
              </div>
              <div class="col-md-5">
                <input type="text" [(ngModel)]="newTrip.dateRange" name="tDates"
                  class="form-control form-control-sm" placeholder="Datumi (piem. 12.07–20.07.2026)" />
              </div>
              <div class="col-md-3">
                <input type="number" [(ngModel)]="newTrip.price" name="tPrice"
                  class="form-control form-control-sm" placeholder="Cena (€)" min="0" />
              </div>
              <div class="col-md-4 d-flex align-items-end">
                <button class="btn btn-primary btn-sm w-100" (click)="addTrip()">Pievienot</button>
              </div>
              <div class="col-12">
                <textarea [(ngModel)]="newTrip.description" name="tDesc"
                  class="form-control form-control-sm" rows="2"
                  placeholder="Īss apraksts"></textarea>
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
                <strong>{{ review.name }}</strong>
                <span class="ms-2 text-muted small">
                  {{ review.text.length > 90 ? (review.text | slice:0:90) + '...' : review.text }}
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
                <input type="text" [(ngModel)]="newReview.name" name="rName"
                  class="form-control form-control-sm" placeholder="Vārds" />
              </div>
              <div class="col-md-3">
                <select [(ngModel)]="newReview.rating" name="rRating"
                  class="form-select form-select-sm">
                  <option [value]="5">5 ★</option>
                  <option [value]="4">4 ★</option>
                  <option [value]="3">3 ★</option>
                  <option [value]="2">2 ★</option>
                  <option [value]="1">1 ★</option>
                </select>
              </div>
              <div class="col-12">
                <textarea [(ngModel)]="newReview.text" name="rText"
                  class="form-control form-control-sm" rows="2"
                  placeholder="Atsauksmes teksts"></textarea>
              </div>
              <div class="col-md-3">
                <button class="btn btn-primary btn-sm" (click)="addReview()">Pievienot</button>
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
  heroPreview = 'italy_mountain.png';
  trips: AdminTrip[] = [];
  reviews: AdminReview[] = [];
  aboutText = '';
  aboutSaved = false;

  newTrip: Omit<AdminTrip, 'id'> = { title: '', destination: '', dateRange: '', price: 0, description: '' };
  newReview: Omit<AdminReview, 'id'> = { name: '', text: '', rating: 5 };

  constructor(private adminState: AdminStateService, private router: Router) {}

  ngOnInit(): void {
    this.heroPreview = this.adminState.heroImageSrc$.value;
    this.trips = [...this.adminState.trips$.value];
    this.reviews = [...this.adminState.reviews$.value];
    this.aboutText = this.adminState.aboutText$.value;
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
    if (!this.newTrip.title.trim()) return;
    const id = Date.now();
    const updated = [...this.trips, { ...this.newTrip, id }];
    this.adminState.trips$.next(updated);
    this.trips = updated;
    this.newTrip = { title: '', destination: '', dateRange: '', price: 0, description: '' };
  }

  removeTrip(id: number): void {
    const updated = this.trips.filter(t => t.id !== id);
    this.adminState.trips$.next(updated);
    this.trips = updated;
  }

  saveAbout(): void {
    this.adminState.aboutText$.next(this.aboutText);
    this.aboutSaved = true;
    setTimeout(() => (this.aboutSaved = false), 2000);
  }

  addReview(): void {
    if (!this.newReview.name.trim() || !this.newReview.text.trim()) return;
    const id = Date.now();
    const updated = [...this.reviews, { ...this.newReview, id }];
    this.adminState.reviews$.next(updated);
    this.reviews = updated;
    this.newReview = { name: '', text: '', rating: 5 };
  }

  removeReview(id: number): void {
    const updated = this.reviews.filter(r => r.id !== id);
    this.adminState.reviews$.next(updated);
    this.reviews = updated;
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  logout(): void {
    this.adminState.logout();
    this.router.navigate(['/admin/login']);
  }
}
