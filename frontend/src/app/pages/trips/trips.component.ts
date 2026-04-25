import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TripService } from '../../shared/services/trip.service';
import { Trip, TripDay } from '../../shared/models/trip.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

const LATVIAN_MONTHS = [
  'Janvāris','Februāris','Marts','Aprīlis','Maijs','Jūnijs',
  'Jūlijs','Augusts','Septembris','Oktobris','Novembris','Decembris'
];

interface MonthOption { key: string; year: number; month: number; label: string; }

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="trips-page">
      <div class="container py-5">
        <h2 class="page-title mb-4">Ceļojumi</h2>

        <div class="page-layout">

          <!-- FILTER SIDEBAR -->
          <aside class="filters-panel">

            <div class="filter-group">
              <h6 class="filter-title">Mēnesis</h6>
              <div *ngFor="let mo of availableMonths" class="filter-option">
                <input type="checkbox" class="filter-check" [id]="'m-' + mo.key"
                  [(ngModel)]="monthSel[mo.key]" (ngModelChange)="applyFilters()">
                <label [for]="'m-' + mo.key">{{ mo.label }}</label>
              </div>
              <p *ngIf="availableMonths.length === 0" class="no-data">Nav datu</p>
            </div>

            <div class="filter-group">
              <h6 class="filter-title">Ilgums (dienas)</h6>
              <div *ngFor="let d of availableDurations" class="filter-option">
                <input type="checkbox" class="filter-check" [id]="'d-' + d"
                  [(ngModel)]="durationSel[d]" (ngModelChange)="applyFilters()">
                <label [for]="'d-' + d">{{ d }} d.</label>
              </div>
              <p *ngIf="availableDurations.length === 0" class="no-data">Nav datu</p>
            </div>

            <div class="filter-group">
              <h6 class="filter-title">Cena (€)</h6>
              <div class="price-range">
                <div class="price-field">
                  <span class="price-label">No</span>
                  <input type="number" class="price-input" placeholder="0" min="0"
                    [(ngModel)]="minPrice" (ngModelChange)="applyFilters()">
                </div>
                <span class="price-sep">–</span>
                <div class="price-field">
                  <span class="price-label">Līdz</span>
                  <input type="number" class="price-input" placeholder="∞" min="0"
                    [(ngModel)]="maxPrice" (ngModelChange)="applyFilters()">
                </div>
              </div>
            </div>

            <button *ngIf="hasActiveFilters" class="btn-reset" (click)="resetFilters()">
              Notīrīt filtrus
            </button>

          </aside>

          <!-- TRIPS GRID -->
          <div class="trips-area">
            <div *ngIf="filteredTrips.length > 0" class="row g-4">
              <div *ngFor="let trip of filteredTrips" class="col-sm-6 col-xl-4">
                <div class="trip-card">
                  <div class="trip-card-img"
                    [style.backgroundImage]="coverMap[trip.id] ? 'url(/images/' + coverMap[trip.id] + ')' : 'none'"
                    [class.no-cover]="!coverMap[trip.id]">
                    <div *ngIf="trip.availableSpots === 0" class="soldout-overlay">Izpārdots</div>
                  </div>
                  <div class="trip-card-body">
                    <h5 class="trip-title">{{ trip.name }}</h5>
                    <p class="trip-dates small mb-2">{{ trip.startDate | date:'dd.MM.yyyy' }} – {{ trip.endDate | date:'dd.MM.yyyy' }} ({{ calculateDays(trip.startDate, trip.endDate) }} dienas)</p>
                    <p class="trip-spots small mb-2">Brīvās vietas: <strong>{{ trip.availableSpots }}</strong></p>
                    <div class="trip-footer">
                      <span class="trip-price">&#8364;{{ (trip.priceCents / 100) | number:'1.0-0' }}</span>
                      <div class="trip-actions">
                        <button class="btn btn-sm btn-outline-secondary" (click)="openTripModal(trip)">Apskatīt</button>
                        <a [routerLink]="['/registration', trip.id]" class="btn btn-sm btn-orange">Pieteikties</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="filteredTrips.length === 0 && !loading" class="empty-state">
              <p class="text-muted">
                {{ trips.length === 0 ? 'Šobrīd nav pieejamu ceļojumu. Lūdzu, pārbaudiet vēlāk.' : 'Nav ceļojumu, kas atbilst filtriem.' }}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ──── Trip Detail Modal ──── -->
    <div *ngIf="selectedTrip" class="trip-modal-overlay" (click)="closeTripModal()">
      <div class="trip-modal-content" (click)="$event.stopPropagation()">
        <div class="trip-modal-inner">

        <button class="modal-close-btn" (click)="closeTripModal()">&#x2715;</button>

        <div *ngIf="modalLoading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <ng-container *ngIf="!modalLoading && selectedTrip">

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

                <section class="modal-section" *ngIf="selectedFlightSchedules.length > 0">
                  <h3 class="modal-heading">Lidojumu datumi un laiki</h3>
                  <div class="flight-schedule-list">
                    <p *ngFor="let entry of selectedFlightSchedules" class="flight-entry">{{ entry }}</p>
                  </div>
                </section>

                <section class="modal-section" *ngIf="selectedTrip.paymentInfo">
                  <h3 class="modal-heading">Apmaksas kārtība</h3>
                  <p class="modal-text">{{ selectedTrip.paymentInfo }}</p>
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

              <div class="col-lg-4">
                <div class="modal-booking-card">
                  <div class="modal-booking-price">
                    <span class="price-label-sm">Cena </span>
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

        <div *ngIf="modalLightboxSrc" class="modal-lightbox" (click)="closeModalLightbox()">
          <img [src]="'/images/' + modalLightboxSrc" class="modal-lightbox-img" (click)="$event.stopPropagation()" />
          <button class="modal-lightbox-close" (click)="closeModalLightbox()">&#x2715;</button>
        </div>

      </div>
    </div>

  `,
  styles: [`
    .trips-page {
      min-height: 100vh;
      background: #f8f9fc;
    }

    .page-title {
      color: #e87722;
      font-weight: 700;
      text-align: center;
    }

    /* ---- LAYOUT ---- */
    .page-layout {
      display: flex;
      gap: 28px;
      align-items: flex-start;
    }

    /* ---- FILTER SIDEBAR ---- */
    .filters-panel {
      flex-shrink: 0;
      width: 210px;
      background: #fff;
      border: 1px solid #e8ebf4;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      position: sticky;
      top: 80px;
    }

    .filter-group {
      margin-bottom: 22px;
    }

    .filter-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #999;
      margin-bottom: 10px;
    }

    .filter-option {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 7px;
      font-size: 0.875rem;
      color: #333;
    }

    .filter-check {
      width: 15px;
      height: 15px;
      accent-color: #e87722;
      cursor: pointer;
      flex-shrink: 0;
    }

    .filter-option label {
      cursor: pointer;
      margin: 0;
    }

    .no-data {
      font-size: 0.8rem;
      color: #bbb;
      margin: 0;
    }

    .price-range {
      display: flex;
      align-items: flex-end;
      gap: 6px;
    }

    .price-field {
      display: flex;
      flex-direction: column;
      gap: 3px;
      flex: 1;
    }

    .price-label {
      font-size: 0.7rem;
      color: #999;
    }

    .price-input {
      width: 100%;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 5px 8px;
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.15s;
    }

    .price-input:focus {
      border-color: #e87722;
    }

    /* Remove browser spin arrows */
    .price-input::-webkit-outer-spin-button,
    .price-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    .price-input[type=number] { -moz-appearance: textfield; }

    .price-sep {
      font-size: 1rem;
      color: #bbb;
      padding-bottom: 6px;
    }

    .btn-reset {
      width: 100%;
      background: none;
      border: 1.5px solid #e87722;
      border-radius: 6px;
      color: #e87722;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 7px 0;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      margin-top: 4px;
    }

    .btn-reset:hover {
      background: #e87722;
      color: #fff;
    }

    /* ---- TRIPS AREA ---- */
    .trips-area {
      flex: 1;
      min-width: 0;
    }

    .trip-card {
      background: #fff;
      border: 1px solid #e8ebf4;
      border-radius: 10px;
      height: 100%;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      transition: transform 0.18s, box-shadow 0.18s;
      overflow: hidden;
    }

    .trip-card-img {
      width: 100%;
      height: 180px;
      background-size: cover;
      background-position: center;
      background-color: #e8eef8;
      position: relative;
    }

    .spots-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.55);
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

    .trip-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.1);
    }

    .trip-card-body {
      padding: 20px;
    }

    .trip-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .trip-dates {
      color: #666;
    }

    .trip-spots {
      color: #666;
      margin-bottom: 8px !important;
    }

    .trip-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 12px;
    }

    .trip-actions {
      display: flex;
      gap: 6px;
    }

    .trip-price {
      font-size: 1.15rem;
      font-weight: 700;
      color: #e87722;
    }

    .btn-orange {
      background: #e87722;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      font-size: 0.8rem;
      padding: 4px 14px;
    }

    .btn-orange:hover {
      background: #cf6510;
      color: #fff;
    }

    .empty-state {
      text-align: center;
      padding: 60px 0;
    }

    @media (max-width: 768px) {
      .page-layout {
        flex-direction: column;
      }
      .filters-panel {
        width: 100%;
        position: static;
      }
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

    .flight-schedule-list { display: flex; flex-direction: column; gap: 6px; }
    .flight-entry {
      margin: 0; color: #333; font-size: 0.97rem; line-height: 1.6;
      padding: 8px 14px; background: #f4f6fb;
      border-left: 3px solid #aa7252; border-radius: 0 6px 6px 0;
    }
    .itinerary-day { margin-bottom: 18px; border: 1.5px solid #e0e8f5; border-radius: 10px; overflow: hidden; }
    .day-header { background: #aa7252; padding: 8px 14px; display: flex; align-items: center; gap: 12px; }
    .day-badge { color: #fff; font-weight: 700; font-size: 0.9rem; }
    .day-date { color: rgba(255,255,255,0.75); font-size: 0.83rem; }
    .day-body { padding: 14px 16px; background: #f8faff; }
    .day-body.has-image { display: grid; grid-template-columns: 1fr 320px; gap: 16px; align-items: start; }

    @media (min-width: 577px) and (max-width: 1199px) {
      .day-body.has-image { display: block; }
      .day-body.has-image .day-img {
        float: right;
        width: 200px;
        margin-left: 16px;
        margin-bottom: 8px;
      }
      .day-body.has-image::after { content: ''; display: table; clear: both; }
    }

    @media (max-width: 576px) {
      .day-body.has-image { display: block; }
    }
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
    .price-label-sm { font-size: 0.8rem; color: #888; }
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
export class TripsComponent implements OnInit {
  trips: Trip[] = [];
  filteredTrips: Trip[] = [];
  coverMap: Record<string, string> = {};
  loading = true;

  selectedTrip: Trip | null = null;
  selectedHeroImage: string | null = null;
  selectedImages: { id: number; path: string; isCover: boolean }[] = [];
  selectedItinerary: TripDay[] = [];
  selectedFlightSchedules: string[] = [];
  modalLightboxSrc: string | null = null;
  modalLoading = false;

  availableMonths: MonthOption[] = [];
  availableDurations: number[] = [];

  monthSel: { [key: string]: boolean } = {};
  durationSel: { [key: number]: boolean } = {};
  minPrice: number | null = null;
  maxPrice: number | null = null;

  constructor(private tripService: TripService) {}

  openTripModal(trip: Trip): void {
    this.selectedTrip = trip;
    this.modalLoading = true;
    this.selectedImages = [];
    this.selectedItinerary = [];
    this.selectedFlightSchedules = [];
    this.selectedHeroImage = null;
    document.body.style.overflow = 'hidden';

    const id = String(trip.id);
    this.tripService.getTrip(id).subscribe({
      next: (fullTrip) => {
        this.selectedTrip = fullTrip;
        this.modalLoading = false;
        if (fullTrip.itineraryJson) {
          try { this.selectedItinerary = JSON.parse(fullTrip.itineraryJson); } catch { /* ignore */ }
        }
        if (fullTrip.flightScheduleJson) {
          try { this.selectedFlightSchedules = JSON.parse(fullTrip.flightScheduleJson); } catch { /* ignore */ }
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
    this.selectedFlightSchedules = [];
    this.selectedHeroImage = null;
    this.modalLightboxSrc = null;
    document.body.style.overflow = '';
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

  ngOnInit(): void {
    this.tripService.getAllTrips().subscribe({
      next: (data) => {
        this.trips = data;
        this.filteredTrips = data;
        this.loading = false;
        this.buildFilterOptions();
        if (data.length === 0) return;
        const coverRequests = data.map(t =>
          this.tripService.getCoverImage(t.id).pipe(catchError(() => of(null)))
        );
        forkJoin(coverRequests).subscribe(results => {
          results.forEach((r, i) => {
            if (r) this.coverMap[data[i].id] = r.path;
          });
        });
      },
      error: () => { this.loading = false; }
    });
  }

  buildFilterOptions(): void {
    const seenMonths = new Set<string>();
    const months: MonthOption[] = [];
    [...this.trips]
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .forEach(t => {
        const d = new Date(t.startDate);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        if (!seenMonths.has(key)) {
          seenMonths.add(key);
          months.push({ key, year: d.getFullYear(), month: d.getMonth() + 1, label: `${LATVIAN_MONTHS[d.getMonth()]} ${d.getFullYear()}` });
        }
      });
    this.availableMonths = months;

    const seenDur = new Set<number>();
    this.trips.forEach(t => seenDur.add(this.getDuration(t)));
    this.availableDurations = Array.from(seenDur).sort((a, b) => a - b);
  }

  get hasActiveFilters(): boolean {
    return Object.values(this.monthSel).some(Boolean)
      || Object.values(this.durationSel).some(Boolean)
      || this.minPrice !== null && this.minPrice.toString() !== ''
      || this.maxPrice !== null && this.maxPrice.toString() !== '';
  }

  getDuration(trip: Trip): number {
    if (trip.tripDurationDays) return trip.tripDurationDays;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  }

  calculateDays(startDate: any, endDate: any): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  applyFilters(): void {
    const selectedMonths = Object.entries(this.monthSel).filter(([, v]) => v).map(([k]) => k);
    const selectedDurations = Object.entries(this.durationSel).filter(([, v]) => v).map(([k]) => Number(k));

    this.filteredTrips = this.trips.filter(trip => {
      if (selectedMonths.length > 0) {
        const d = new Date(trip.startDate);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        if (!selectedMonths.includes(key)) return false;
      }
      if (selectedDurations.length > 0 && !selectedDurations.includes(this.getDuration(trip))) return false;
      const euros = trip.priceCents / 100;
      if (this.minPrice !== null && euros < this.minPrice) return false;
      if (this.maxPrice !== null && euros > this.maxPrice) return false;
      return true;
    });
  }

  resetFilters(): void {
    this.monthSel = {};
    this.durationSel = {};
    this.minPrice = null;
    this.maxPrice = null;
    this.filteredTrips = [...this.trips];
  }
}
