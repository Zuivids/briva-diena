import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TripService } from '../../shared/services/trip.service';
import { Trip } from '../../shared/models/trip.model';
import { HttpStatusCode } from '@angular/common/http';

interface TripImage { id: number; path: string; isCover: boolean; }

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="trip-detail-page">

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="container py-5 text-center">
        <p class="text-danger">{{ error }}</p>
        <a routerLink="/trips" class="btn btn-outline-primary btn-sm">Atpakaļ uz ceļojumiem</a>
      </div>

      <!-- Content -->
      <ng-container *ngIf="!loading && trip">

        <!-- Hero image -->
        <div class="trip-hero" [style.backgroundImage]="heroImage ? 'url(' + imageBase + heroImage + ')' : 'none'">
          <div class="trip-hero-overlay">
            <div class="container">
              <a routerLink="/trips" class="back-link">&#8592; Visi ceļojumi</a>
              <h1 class="trip-hero-title">{{ trip.name }}</h1>
              <div class="trip-hero-meta">
                <span class="meta-chip">&#128197; {{ trip.startDate | date:'dd.MM.yyyy' }} &ndash; {{ trip.endDate | date:'dd.MM.yyyy' }}</span>
                <span class="meta-chip">&#128205; {{ durationDays }} dienas</span>
                <span class="meta-chip spots" [class.few-spots]="trip.availableSpots <= 3">
                  {{ trip.availableSpots > 0 ? trip.availableSpots + ' brīvas vietas' : 'Pilns' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="container py-5">
          <div class="row g-5">

            <!-- Left — description + gallery -->
            <div class="col-lg-8">

              <section class="detail-section" *ngIf="trip.description">
                <h3 class="detail-heading">Par ceļojumu</h3>
                <p class="detail-text">{{ trip.description }}</p>
              </section>

              <!-- Image gallery -->
              <section class="detail-section" *ngIf="images.length > 0">
                <h3 class="detail-heading">Foto galerija</h3>
                <div class="gallery-grid">
                  <img *ngFor="let img of images"
                       [src]="imageBase + img.path"
                       [alt]="trip.name"
                       class="gallery-img"
                       (click)="openLightbox(img.path)"
                  />
                </div>
              </section>

            </div>

            <!-- Right — booking card -->
            <div class="col-lg-4">
              <div class="booking-card">
                <div class="booking-price">
                  <span class="price-label">Cena no</span>
                  <span class="price-value">&euro;{{ (trip.priceCents / 100) | number:'1.0-0' }}</span>
                  <span class="price-per">/ personai</span>
                </div>

                <ul class="booking-info-list">
                  <li>
                    <span class="info-icon">&#128197;</span>
                    <span><strong>Sākums:</strong> {{ trip.startDate | date:'dd. MMMM yyyy':'':'lv' }}</span>
                  </li>
                  <li>
                    <span class="info-icon">&#128197;</span>
                    <span><strong>Beigas:</strong> {{ trip.endDate | date:'dd. MMMM yyyy':'':'lv' }}</span>
                  </li>
                  <li>
                    <span class="info-icon">&#9200;</span>
                    <span><strong>Ilgums:</strong> {{ durationDays }} dienas</span>
                  </li>
                  <li>
                    <span class="info-icon">&#128101;</span>
                    <span><strong>Brīvas vietas:</strong>
                      <span [class.text-danger]="trip.availableSpots <= 3">{{ trip.availableSpots }}</span>
                    </span>
                  </li>
                </ul>

                <a *ngIf="trip.availableSpots > 0"
                   [routerLink]="['/registration', trip.id]"
                   class="btn btn-book w-100">Pieteikties</a>
                <button *ngIf="trip.availableSpots === 0" class="btn btn-book w-100" disabled>Pilns</button>
              </div>
            </div>

          </div>
        </div>
      </ng-container>

      <!-- Lightbox -->
      <div *ngIf="lightboxSrc" class="lightbox" (click)="closeLightbox()">
        <img [src]="imageBase + lightboxSrc" class="lightbox-img" (click)="$event.stopPropagation()" />
        <button class="lightbox-close" (click)="closeLightbox()">&#x2715;</button>
      </div>

    </div>
  `,
  styles: [`
    .trip-detail-page {
      min-height: 100vh;
      background: #f8f9fc;
    }

    /* Hero */
    .trip-hero {
      height: 420px;
      background-size: cover;
      background-position: center;
      background-color: #1746a0;
      position: relative;
    }

    .trip-hero-overlay {
      height: 100%;
      background: linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 100%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding-bottom: 40px;
    }

    .back-link {
      color: rgba(255,255,255,0.8);
      font-size: 0.85rem;
      text-decoration: none;
      display: inline-block;
      margin-bottom: 12px;
    }

    .back-link:hover { color: #fff; }

    .trip-hero-title {
      color: #fff;
      font-size: 2.4rem;
      font-weight: 700;
      margin: 0 0 14px;
      text-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }

    .trip-hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .meta-chip {
      background: rgba(255,255,255,0.18);
      color: #fff;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      backdrop-filter: blur(4px);
    }

    .meta-chip.few-spots { background: rgba(220,53,69,0.6); }

    /* Sections */
    .detail-section { margin-bottom: 40px; }

    .detail-heading {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1746a0;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e8eef8;
    }

    .detail-text {
      color: #444;
      line-height: 1.8;
      white-space: pre-line;
    }

    /* Gallery */
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 10px;
    }

    .gallery-img {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.18s, box-shadow 0.18s;
    }

    .gallery-img:hover {
      transform: scale(1.03);
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
    }

    /* Booking card */
    .booking-card {
      background: #fff;
      border-radius: 14px;
      padding: 28px;
      box-shadow: 0 4px 20px rgba(23, 70, 160, 0.1);
      position: sticky;
      top: 90px;
    }

    .booking-price {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .price-label {
      font-size: 0.8rem;
      color: #888;
    }

    .price-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1746a0;
    }

    .price-per {
      font-size: 0.8rem;
      color: #888;
    }

    .booking-info-list {
      list-style: none;
      padding: 0;
      margin: 0 0 24px;
    }

    .booking-info-list li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid #f0f2f8;
      font-size: 0.9rem;
      color: #444;
    }

    .booking-info-list li:last-child { border-bottom: none; }

    .info-icon { font-size: 1rem; min-width: 20px; }

    .btn-book {
      background: #e87722;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      padding: 12px;
      transition: background 0.18s;
    }

    .btn-book:hover:not(:disabled) { background: #cf6510; }
    .btn-book:disabled { background: #aaa; cursor: not-allowed; }

    /* Lightbox */
    .lightbox {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.88);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      cursor: pointer;
    }

    .lightbox-img {
      max-width: 90vw;
      max-height: 85vh;
      border-radius: 8px;
      cursor: default;
    }

    .lightbox-close {
      position: absolute;
      top: 20px;
      right: 28px;
      background: none;
      border: none;
      color: #fff;
      font-size: 2rem;
      cursor: pointer;
      line-height: 1;
    }
  `]
})
export class TripDetailComponent implements OnInit {
  trip: Trip | null = null;
  images: TripImage[] = [];
  heroImage: string | null = null;
  lightboxSrc: string | null = null;
  loading = true;
  error = '';
  readonly imageBase = 'http://localhost:8080/images/';

  constructor(private route: ActivatedRoute, private tripService: TripService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.tripService.getTrip(id).subscribe({
      next: (trip) => {
        this.trip = trip;
        this.loading = false;
        // Load gallery images
        this.tripService.getTripImages(id).subscribe({
          next: (imgs) => {
            this.images = imgs;
          },
          error: () => {}
        });
        // Load cover separately
        this.tripService.getCoverImage(id).subscribe({
          next: (cover) => { this.heroImage = cover.path; },
          error: () => { this.heroImage = null; }
        });
      },
      error: () => {
        this.error = 'Ceļojums nav atrasts.';
        this.loading = false;
      }
    });
  }

  get durationDays(): number {
    if (!this.trip) return 0;
    const start = new Date(this.trip.startDate);
    const end = new Date(this.trip.endDate);
    return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  }

  openLightbox(path: string): void { this.lightboxSrc = path; }
  closeLightbox(): void { this.lightboxSrc = null; }
}

