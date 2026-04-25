import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminStateService } from '../../shared/services/admin-state.service';
import { TripService } from '../../shared/services/trip.service';
import { ReviewService } from '../../shared/services/review.service';
import { InstagramService } from '../../shared/services/instagram.service';
import { Trip, TripDay } from '../../shared/models/trip.model';
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
          <h2 class="section-title mb-4">Gaidāmie ceļojumi</h2>

          <div *ngIf="topTrips.length > 0" class="row g-4 mb-4">
            <div *ngFor="let trip of topTrips" class="col-md-4">
              <div class="trip-card">
                <div class="trip-card-img" [style.backgroundImage]="coverMapTop[trip.id] ? 'url(/images/' + coverMapTop[trip.id] + ')' : 'none'" [class.no-cover]="!coverMapTop[trip.id]">
                </div>
                <div class="trip-card-body">
                  <h5 class="trip-title">{{ trip.name }}</h5>
                  <p class="trip-dates small mb-2">
                    {{ trip.startDate | date:'dd.MM.yyyy' }} &ndash; {{ trip.endDate | date:'dd.MM.yyyy' }} ({{ calculateDays(trip.startDate, trip.endDate) }} dienas)
                  </p>
                  <p class="trip-spots small mb-2">Brīvās vietas: <strong>{{ trip.availableSpots }}</strong></p>
                  <div class="trip-footer">
                    <span class="trip-price">&#8364;{{ (trip.priceCents / 100) | number:'1.0-0' }}</span>
                    <div class="trip-actions">
                      <button class="btn btn-sm btn-outline-secondary" (click)="openTripModal(trip)">Apskatīt</button>
                      <a [routerLink]="['/registration', trip.id]" class="btn btn-sm btn-register-sm">Pieteikties</a>
                    </div>
                  </div>
                </div>
              </div>
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
          <h2 class="section-title">Kas ir Brīva diena?</h2>
          <p class="about-text">{{ adminState.aboutText$ | async }}</p>
        </div>
      </section>

      <!-- Last Chance Section -->
      <section *ngIf="lastChanceTrips.length > 0" class="last-chance-section py-5">
        <div class="container">
          <h2 class="section-title mb-4">Pēdējā iespēja</h2>

          <div class="row g-4 mb-4">
            <div *ngFor="let trip of lastChanceTrips" class="col-md-4">
              <div class="trip-card">
                <div class="trip-card-img" [style.backgroundImage]="coverMapLastChance[trip.id] ? 'url(/images/' + coverMapLastChance[trip.id] + ')' : 'none'" [class.no-cover]="!coverMapLastChance[trip.id]">
                </div>
                <div class="trip-card-body">
                  <h5 class="trip-title">{{ trip.name }}</h5>
                  <p class="trip-dates small mb-2">
                    {{ trip.startDate | date:'dd.MM.yyyy' }} &ndash; {{ trip.endDate | date:'dd.MM.yyyy' }} ({{ calculateDays(trip.startDate, trip.endDate) }} dienas)
                  </p>
                  <p class="trip-spots small mb-2">Brīvās vietas: <strong>{{ trip.availableSpots }}</strong></p>
                  <p *ngIf="trip.description" class="trip-desc small text-muted">{{ trip.description }}</p>
                  <div class="trip-footer">
                    <span class="trip-price">&#8364;{{ (trip.priceCents / 100) | number:'1.0-0' }}</span>
                    <div class="trip-actions">
                      <button class="btn btn-sm btn-outline-secondary" (click)="openTripModal(trip)">Apskatīt</button>
                      <a [routerLink]="['/registration', trip.id]" class="btn btn-sm btn-register-sm">Pieteikties</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Instagram Section -->
      <section *ngIf="instagramUrls.length > 0" class="instagram-section py-5 bg-light">
        <div class="container">
          <h2 class="section-title mb-4">Ieskaties</h2>
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

    <!-- ──── Trip Detail Modal ──── -->
    <div *ngIf="selectedTrip" class="trip-modal-overlay" (click)="closeTripModal()">
      <div class="trip-modal-content" (click)="$event.stopPropagation()">
        <div class="trip-modal-inner">

        <button class="modal-close-btn" (click)="closeTripModal()">&#x2715;</button>

        <!-- Loading -->
        <div *ngIf="modalLoading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <!-- Content -->
        <ng-container *ngIf="!modalLoading && selectedTrip">

          <!-- Hero -->
          <div class="modal-hero" [style.backgroundImage]="selectedHeroImage ? 'url(/images/' + selectedHeroImage + ')' : 'none'">
            <div class="modal-hero-overlay">
              <div class="container">
                <h1 class="modal-hero-title">{{ selectedTrip.name }}</h1>
                <div class="modal-hero-meta">
                  <span class="meta-chip">{{ selectedTrip.startDate | date:'dd.MM.yyyy' }} &ndash; {{ selectedTrip.endDate | date:'dd.MM.yyyy' }}</span>
                  <span class="meta-chip">{{ modalDurationDays }} dienas</span>
                  <span class="meta-chip" [class.few-spots]="selectedTrip.availableSpots <= 3">
                    {{ selectedTrip.availableSpots > 0 ? selectedTrip.availableSpots + ' brīvas vietas' : 'Pilns' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="container py-4">
            <div class="row g-4">

              <!-- Left column -->
              <div class="col-lg-8">

                <section class="modal-section" *ngIf="selectedTrip.description">
                  <h3 class="modal-heading">Ko mēs piedzīvosim</h3>
                  <p class="modal-text">{{ selectedTrip.description }}</p>
                </section>

                <section class="modal-section" *ngIf="selectedItinerary.length > 0">
                  <h3 class="modal-heading">Dienas programma</h3>
                  <div *ngFor="let day of selectedItinerary" class="itinerary-day">
                    <div class="day-header">
                      <span class="day-badge">{{ day.dayNumber }}. diena</span>
                      <span *ngIf="day.date" class="day-date">{{ day.date | date:'dd.MM.yyyy' }}</span>
                    </div>
                    <div class="day-body" [class.has-image]="day.imagePath">
                      <p class="day-desc">{{ day.description }}</p>
                      <img *ngIf="day.imagePath" [src]="'/images/' + day.imagePath"
                           [alt]="'Diena ' + day.dayNumber"
                           class="day-img"
                           (click)="openModalLightbox(day.imagePath!)" />
                    </div>
                  </div>
                </section>

                <section class="modal-section" *ngIf="selectedTrip.priceIncluded || selectedTrip.extraCharge">
                  <h3 class="modal-heading">Cenas informācija</h3>
                  <div class="row g-4">
                    <div class="col-sm-6" *ngIf="selectedTrip.priceIncluded">
                      <div class="price-block included">
                        <div class="price-block-title">&#10003; Iekļauts cenā</div>
                        <p class="price-block-text">{{ selectedTrip.priceIncluded }}</p>
                      </div>
                    </div>
                    <div class="col-sm-6" *ngIf="selectedTrip.extraCharge">
                      <div class="price-block extra">
                        <div class="price-block-title">+ Papildmaksa</div>
                        <p class="price-block-text">{{ selectedTrip.extraCharge }}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section class="modal-section" *ngIf="modalGalleryImages.length > 0">
                  <h3 class="modal-heading">Foto galerija</h3>
                  <div class="gallery-grid">
                    <img *ngFor="let img of modalGalleryImages"
                         [src]="'/images/' + img.path"
                         [alt]="selectedTrip.name"
                         class="gallery-img"
                         (click)="openModalLightbox(img.path)" />
                  </div>
                </section>

              </div>

              <!-- Booking card -->
              <div class="col-lg-4">
                <div class="modal-booking-card">
                  <div class="modal-booking-price">
                    <span class="price-label">Cena </span>
                    <span class="price-value">&euro;{{ (selectedTrip.priceCents / 100) | number:'1.0-0' }}</span>
                    <span class="price-per"> personai</span>
                  </div>
                  <ul class="modal-booking-list">
                    <li><span><strong>Brīvas vietas:</strong> <span [class.text-danger]="selectedTrip.availableSpots <= 3">{{ selectedTrip.availableSpots }}</span></span></li>
                    <li><span><strong>Sākums:</strong> {{ selectedTrip.startDate | date:'dd.MM.yyyy' }}</span></li>
                    <li><span><strong>Beigas:</strong> {{ selectedTrip.endDate | date:'dd.MM.yyyy' }}</span></li>
                    <li><span><strong>Ilgums:</strong> {{ modalDurationDays }} dienas</span></li>
                    <li *ngIf="selectedTrip.airlineCompany"><span><strong>Aviosabiedrība:</strong> {{ selectedTrip.airlineCompany }}</span></li>
                    <li *ngIf="selectedTrip.includedBaggageSize"><span><strong>Cenā iekļautā bagāža:</strong> {{ selectedTrip.includedBaggageSize }}</span></li>
                    <li *ngIf="selectedTrip.groupSize"><span><strong>Grupas izmērs:</strong> {{ selectedTrip.groupSize }} cilvēki</span></li>
                    <li *ngIf="selectedTrip.accommodation"><span><strong>Naktsmītnes:</strong> {{ selectedTrip.accommodation }}</span></li>
                  </ul>
                  <a *ngIf="selectedTrip.availableSpots > 0"
                     [routerLink]="['/registration', selectedTrip.id]"
                     class="btn btn-modal-book w-100"
                     (click)="closeTripModal()">Pieteikties</a>
                  <button *ngIf="selectedTrip.availableSpots === 0" class="btn btn-modal-book w-100" disabled>Pilns</button>
                </div>
              </div>

            </div>
          </div>

        </ng-container>

        </div><!-- /.trip-modal-inner -->

        <!-- Lightbox inside modal -->
        <div *ngIf="modalLightboxSrc" class="modal-lightbox" (click)="closeModalLightbox()">
          <img [src]="'/images/' + modalLightboxSrc" class="modal-lightbox-img" (click)="$event.stopPropagation()" />
          <button class="modal-lightbox-close" (click)="closeModalLightbox()">&#x2715;</button>
        </div>

      </div>
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
      background: #fff; border: 1px solid #e8ebf4; border-radius: 10px;
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

    /* ──── Trip Detail Modal ──── */
    .trip-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.75);
      z-index: 1500;
      cursor: pointer;
    }

    .trip-modal-content {
      position: fixed;
      top: 5%;
      left: 5%;
      right: 5%;
      bottom: 5%;
      background: #f8f9fc;
      border-radius: 14px;
      overflow: hidden;
      cursor: default;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      display: flex;
      flex-direction: column;
    }
    .trip-modal-inner {
      overflow-y: auto;
      flex: 1 1 auto;
    }

    .modal-close-btn {
      position: sticky;
      top: 12px;
      float: right;
      margin: 12px 16px 0 0;
      background: rgba(0,0,0,0.5);
      border: none;
      color: #fff;
      font-size: 1.3rem;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      line-height: 1;
    }
    .modal-close-btn:hover { background: rgba(0,0,0,0.75); }

    .modal-hero {
      height: 240px;
      background-size: cover;
      background-position: center;
      background-color: #aa7252;
      border-radius: 14px 14px 0 0;
    }
    .modal-hero-overlay {
      height: 100%;
      background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding-bottom: 20px;
      border-radius: 14px 14px 0 0;
    }
    .modal-hero-title { color: #fff; font-size: 1.7rem; font-weight: 700; margin: 0 0 8px; text-shadow: 0 2px 8px rgba(0,0,0,0.4); }
    .modal-hero-meta { display: flex; flex-wrap: wrap; gap: 8px; }
    .meta-chip { background: rgba(255,255,255,0.18); color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.82rem; backdrop-filter: blur(4px); }
    .meta-chip.few-spots { background: rgba(220,53,69,0.6); }

    .modal-section { margin-bottom: 28px; }
    .modal-heading { font-size: 1.15rem; font-weight: 700; color: #aa7252; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e8eef8; }
    .modal-text { color: #444; line-height: 1.8; white-space: pre-line; }

    .itinerary-day { margin-bottom: 18px; border: 1.5px solid #e0e8f5; border-radius: 10px; overflow: hidden; }
    .day-header { background: #aa7252; padding: 8px 14px; display: flex; align-items: center; gap: 12px; }
    .day-badge { color: #fff; font-weight: 700; font-size: 0.9rem; }
    .day-date { color: rgba(255,255,255,0.75); font-size: 0.83rem; }
    .day-body { padding: 12px 14px; background: #f8faff; }
    .day-body.has-image { display: grid; grid-template-columns: 1fr 160px; gap: 14px; align-items: start; }
    .day-desc { color: #444; line-height: 1.7; white-space: pre-line; margin: 0; }
    .day-img { width: 100%; border-radius: 8px; object-fit: cover; aspect-ratio: 4/3; cursor: pointer; transition: opacity 0.18s; }
    .day-img:hover { opacity: 0.88; }

    .price-block { border-radius: 10px; padding: 14px; height: 100%; }
    .price-block.included { background: #f0faf4; border: 1.5px solid #b6e8c8; }
    .price-block.extra { background: #fff8f0; border: 1.5px solid #f5d9b0; }
    .price-block-title { font-weight: 700; font-size: 0.9rem; margin-bottom: 6px; }
    .price-block.included .price-block-title { color: #1a6e3a; }
    .price-block.extra .price-block-title { color: #a0540a; }
    .price-block-text { color: #444; font-size: 0.87rem; line-height: 1.7; white-space: pre-line; margin: 0; }

    .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
    .gallery-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 8px; cursor: pointer; transition: transform 0.18s, box-shadow 0.18s; }
    .gallery-img:hover { transform: scale(1.03); box-shadow: 0 4px 14px rgba(0,0,0,0.18); }

    .modal-booking-card { background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 4px 18px rgba(170,114,82,0.12); position: sticky; top: 16px; }
    .modal-booking-price { display: flex; align-items: baseline; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
    .price-label { font-size: 0.8rem; color: #888; }
    .price-value { font-size: 1.7rem; font-weight: 700; color: #aa7252; }
    .price-per { font-size: 0.8rem; color: #888; }
    .modal-booking-list { list-style: none; padding: 0; margin: 0 0 18px; }
    .modal-booking-list li { display: flex; align-items: flex-start; gap: 8px; padding: 6px 0; border-bottom: 1px solid #f0f2f8; font-size: 0.88rem; color: #444; }
    .modal-booking-list li:last-child { border-bottom: none; }
    .btn-modal-book {
      background: #e87722; color: #fff; border: none; border-radius: 8px;
      font-size: 1rem; font-weight: 600; padding: 11px; transition: background 0.18s;
      display: block; width: 100%; text-align: center; text-decoration: none;
    }
    .btn-modal-book:hover:not(:disabled) { background: #cf6510; color: #fff; }
    .btn-modal-book:disabled { background: #aaa; cursor: not-allowed; }

    .modal-lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.88); display: flex; align-items: center; justify-content: center; z-index: 2000; cursor: pointer; }
    .modal-lightbox-img { max-width: 90vw; max-height: 85vh; border-radius: 8px; cursor: default; }
    .modal-lightbox-close { position: absolute; top: 20px; right: 28px; background: none; border: none; color: #fff; font-size: 2rem; cursor: pointer; line-height: 1; }
  `]
})
export class LandingComponent implements OnInit, AfterViewInit {
  topTrips: Trip[] = [];
  lastChanceTrips: Trip[] = [];
  reviews: Review[] = [];
  coverMapTop: Record<string, string> = {};
  coverMapLastChance: Record<string, string> = {};
  topLoading = true;
  lastChanceLoading = true;
  reviewsLoading = true;
  instagramUrls: string[] = [];

  selectedTrip: Trip | null = null;
  selectedHeroImage: string | null = null;
  selectedImages: { id: number; path: string; isCover: boolean }[] = [];
  selectedItinerary: TripDay[] = [];
  modalLightboxSrc: string | null = null;
  modalLoading = false;

  constructor(
    public adminState: AdminStateService,
    private tripService: TripService,
    private reviewService: ReviewService,
    private instagramService: InstagramService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
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

  calculateDays(startDate: any, endDate: any): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  openTripModal(trip: Trip): void {
    this.selectedTrip = trip;
    this.modalLoading = true;
    this.selectedImages = [];
    this.selectedItinerary = [];
    this.selectedHeroImage = null;
    this.document.body.style.overflow = 'hidden';

    const id = String(trip.id);
    this.tripService.getTrip(id).subscribe({
      next: (fullTrip) => {
        this.selectedTrip = fullTrip;
        this.modalLoading = false;
        if (fullTrip.itineraryJson) {
          try { this.selectedItinerary = JSON.parse(fullTrip.itineraryJson); } catch { /* ignore */ }
        }
        this.tripService.getTripImages(id).subscribe({
          next: (imgs) => { this.selectedImages = imgs; },
          error: () => {}
        });
        this.tripService.getCoverImage(id).subscribe({
          next: (cover) => { this.selectedHeroImage = cover.path; },
          error: () => {}
        });
      },
      error: () => { this.modalLoading = false; }
    });
  }

  closeTripModal(): void {
    this.selectedTrip = null;
    this.selectedImages = [];
    this.selectedItinerary = [];
    this.selectedHeroImage = null;
    this.modalLightboxSrc = null;
    this.document.body.style.overflow = '';
  }

  get modalDurationDays(): number {
    if (!this.selectedTrip) return 0;
    return this.calculateDays(this.selectedTrip.startDate, this.selectedTrip.endDate);
  }

  get modalGalleryImages(): { id: number; path: string; isCover: boolean }[] {
    return this.selectedImages.filter(img => !img.isCover);
  }

  openModalLightbox(path: string): void { this.modalLightboxSrc = path; }
  closeModalLightbox(): void { this.modalLightboxSrc = null; }
}

