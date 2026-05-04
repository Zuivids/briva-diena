import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TripService } from '../../shared/services/trip.service';
import { Trip } from '../../shared/models/trip.model';
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
        <h2 class="page-title mb-4">CEĻOJUMI</h2>

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
                <a [routerLink]="['/trip', trip.id]" class="trip-card-link">
                <div class="trip-card">
                  <div class="trip-card-img"
                    [style.backgroundImage]="coverMap[trip.id] ? 'url(/images/' + coverMap[trip.id] + ')' : 'none'"
                    [class.no-cover]="!coverMap[trip.id]">
                    <div *ngIf="trip.availableSpots === 0" class="soldout-overlay">Izpārdots</div>
                  </div>
                  <div class="trip-card-body">
                    <h5 class="trip-title">{{ trip.name }}</h5>
                    <p class="trip-dates small mb-2">{{ trip.startDate | date:'dd.MM.yyyy' }} – {{ trip.endDate | date:'dd.MM.yyyy' }}</p>
                    <p class="trip-spots small mb-2">Brīvās vietas: <strong>{{ trip.availableSpots }}</strong></p>
                    <div class="trip-footer">
                      <span class="trip-price">&#8364;{{ (trip.priceCents / 100) | number:'1.0-0' }}</span>
                      <div class="trip-actions">
                        <a [routerLink]="['/trip', trip.id]" class="btn btn-sm btn-outline-secondary" (click)="$event.stopPropagation()">Apskatīt</a>
                        <a [routerLink]="['/registration', trip.id]" class="btn btn-sm btn-orange" (click)="$event.stopPropagation()">Pieteikties</a>
                      </div>
                    </div>
                  </div>
                </div>
                </a>
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

  `,
  styles: [`
    .trips-page {
      min-height: 100vh;
      background: #f8f9fc;
    }

    .page-title {
      color: #5C4033;
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

    .trip-card-link {
      display: block;
      text-decoration: none;
      color: inherit;
      height: 100%;
    }
    .trip-card-link:hover { color: inherit; }

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
      font-size: 2rem;
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
  `]
})
export class TripsComponent implements OnInit {
  trips: Trip[] = [];
  filteredTrips: Trip[] = [];
  coverMap: Record<string, string> = {};
  loading = true;

  availableMonths: MonthOption[] = [];
  availableDurations: number[] = [];

  monthSel: { [key: string]: boolean } = {};
  durationSel: { [key: number]: boolean } = {};
  minPrice: number | null = null;
  maxPrice: number | null = null;

  constructor(private tripService: TripService) {}

  ngOnInit(): void {
    this.tripService.getAllTrips().subscribe({
      next: (data) => {
        const visible = data.filter(t => !t.hidden);
        this.trips = visible;
        this.filteredTrips = visible;
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
