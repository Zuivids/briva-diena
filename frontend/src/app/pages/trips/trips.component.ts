import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TripService } from '../../shared/services/trip.service';
import { Trip } from '../../shared/models/trip.model';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="trips-page">
      <div class="container py-5">
        <h2 class="page-title mb-4">Ceļojumi</h2>

        <div *ngIf="trips.length > 0" class="row g-4">
          <div *ngFor="let trip of trips" class="col-md-6 col-lg-4">
            <div class="trip-card">
              <div class="trip-card-body">
                <h5 class="trip-title">{{ trip.name }}</h5>
                <p class="trip-dates small mb-2">{{ trip.startDate | date:'dd.MM.yyyy' }} &ndash; {{ trip.endDate | date:'dd.MM.yyyy' }}</p>
                <p *ngIf="trip.description" class="trip-desc small text-muted mb-3">{{ trip.description }}</p>
                <div class="trip-footer">
                  <span class="trip-price">&#8364;{{ (trip.priceCents / 100) | number:'1.0-0' }}</span>
                  <a routerLink="/trips" class="btn btn-sm btn-orange">Pieteikties</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="trips.length === 0 && !loading" class="empty-state">
          <p class="text-muted">Šobrīd nav pieejamu ceļojumu. Lūdzu, pārbaudiet vēlāk.</p>
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
      color: #1746a0;
      font-weight: 700;
    }

    .trip-card {
      background: #fff;
      border: 1px solid #e8ebf4;
      border-radius: 10px;
      height: 100%;
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
  `]
})
export class TripsComponent implements OnInit {
  trips: Trip[] = [];
  loading = true;

  constructor(private tripService: TripService) {}

  ngOnInit(): void {
    this.tripService.getAllTrips().subscribe({
      next: (data) => { this.trips = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
