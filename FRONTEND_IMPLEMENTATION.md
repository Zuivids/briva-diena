# Brivadiena.lv Frontend Implementation Guide

This document provides step-by-step instructions for building the Angular frontend for the Brivadiena.lv travel agency website.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Architecture Overview](#architecture-overview)
3. [Component Structure](#component-structure)
4. [Implementation Steps](#implementation-steps)
5. [API Integration](#api-integration)
6. [Admin Panel](#admin-panel)

---

## Project Setup

### Prerequisites

- Node.js (v18+) and npm (v9+)
- Angular CLI v17+
- Visual Studio Code or preferred IDE

### Initialize Angular Project

```bash
# Create a new Angular workspace
ng new frontend --routing --style=css --package-manager=npm

# Navigate to the project
cd frontend

# Install additional dependencies
npm install @angular/common @angular/forms @angular/router
npm install bootstrap ngx-bootstrap date-fns
npm install stripe-js
```

### Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   └── footer/
│   │   │   ├── services/
│   │   │   │   ├── trip.service.ts
│   │   │   │   ├── payment.service.ts
│   │   │   │   └── auth.service.ts
│   │   │   └── models/
│   │   │       ├── trip.model.ts
│   │   │       ├── registration.model.ts
│   │   │       └── payment.model.ts
│   │   ├── pages/
│   │   │   ├── landing/
│   │   │   ├── trips/
│   │   │   ├── about/
│   │   │   ├── contacts/
│   │   │   ├── reviews/
│   │   │   ├── faq/
│   │   │   ├── registration/
│   │   │   └── payment-success/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── login/
│   │   │   └── trip-management/
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   ├── assets/
│   └── styles/
│       └── styles.css
├── package.json
└── angular.json
```

---

## Architecture Overview

### Component Hierarchy

```
App
├── Navbar (Shared)
│   ├── Ceļojumi (Trips)
│   ├── Par Brīva diena (About)
│   ├── Kontakti (Contacts)
│   ├── Atsauksmes (Reviews)
│   └── BUJ (FAQ)
├── Router Outlet
│   ├── Landing Page
│   │   ├── Featured Trips Section
│   │   ├── About Section
│   │   └── Reviews Section
│   ├── Trips List Page
│   │   ├── Filters
│   │   └── Trip Card Grid
│   ├── Trip Detail Page
│   ├── About Page
│   ├── Contacts Page
│   ├── Reviews Page
│   ├── FAQ Page
│   ├── Registration Page
│   ├── Payment Page
│   └── Admin Section
│       ├── Login
│       └── Dashboard
└── Footer (Shared)
```

### Data Models

```typescript
// Trip Model
export interface Trip {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  price: number;
  currency: string;
  availableSpots: number;
  images: string[];
  mainImage: string;
  createdAt: Date;
}

// Registration Model
export interface Registration {
  tripId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  personalId?: string; // Personas kods (optional)
  passportNumber?: string;
  passportExpiryDate?: Date;
}

// Payment Model
export interface Payment {
  id: string;
  registrationId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  paymentMethod: string;
  stripeSessionId?: string;
  createdAt: Date;
}

// Review Model
export interface Review {
  id: string;
  customerName: string;
  tripName: string;
  rating: number;
  text: string;
  createdAt: Date;
}

// FAQ Model
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}
```

---

## Component Structure

### 1. Navbar Component (Shared)

**File:** `src/app/shared/components/navbar/navbar.component.ts`

```typescript
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container">
        <a class="navbar-brand" routerLink="/">
          <strong>Brīva diena</strong>
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/trips" routerLinkActive="active">
                Ceļojumi
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/about" routerLinkActive="active">
                Par Brīva diena
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/contacts"
                routerLinkActive="active"
              >
                Kontakti
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/reviews"
                routerLinkActive="active"
              >
                Atsauksmes
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/faq" routerLinkActive="active">
                BUJ
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/admin/login"
                class="btn btn-outline-primary ms-2"
              >
                Admin
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent {}
```

### 2. Landing Page Component

**File:** `src/app/pages/landing/landing.component.ts`

**Key Features:**

- Display 4 featured trips
- "Apskatīt visus" (View All) button linking to trips page
- About section
- Reviews section

```typescript
import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { TripService } from "../../shared/services/trip.service";
import { Trip } from "../../shared/models/trip.model";

@Component({
  selector: "app-landing",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-page">
      <!-- Featured Trips Section -->
      <section class="featured-trips py-5">
        <div class="container">
          <h2>Pieejamie ceļojumi</h2>
          <div class="row">
            <div class="col-md-3" *ngFor="let trip of featuredTrips">
              <div class="trip-card">
                <img
                  [src]="trip.mainImage"
                  [alt]="trip.name"
                  class="trip-image"
                />
                <h5>{{ trip.name }}</h5>
                <p class="date-range">
                  {{ trip.startDate | date: "dd.MM.yyyy" }} -
                  {{ trip.endDate | date: "dd.MM.yyyy" }}
                </p>
                <p class="price">{{ trip.price }} €</p>
                <p class="spots">Pieejamas vietas: {{ trip.availableSpots }}</p>
              </div>
            </div>
          </div>
          <div class="text-center mt-4">
            <a routerLink="/trips" class="btn btn-primary btn-lg">
              Apskatīt visus
            </a>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section class="about-section py-5 bg-light">
        <div class="container">
          <h2>Kas ir Brīva diena?</h2>
          <p>
            Brīva diena ir ceļojumu aģentūra, kas piedāvā neatvairāmas ceļojuma
            pieredzes par pieņemamām cenām...
          </p>
        </div>
      </section>

      <!-- Reviews Section -->
      <section class="reviews-section py-5">
        <div class="container">
          <h2>Atsauksmes</h2>
          <div class="row">
            <div class="col-md-4" *ngFor="let review of reviews">
              <div class="review-card">
                <p>"{{ review.text }}"</p>
                <p class="reviewer-name">- {{ review.customerName }}</p>
                <p class="trip-name">{{ review.tripName }}</p>
              </div>
            </div>
          </div>
          <div class="text-center mt-4">
            <a routerLink="/reviews" class="btn btn-outline-primary">
              Apskatīt vairāk atsauksmju
            </a>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrls: ["./landing.component.css"],
})
export class LandingComponent implements OnInit {
  featuredTrips: Trip[] = [];
  reviews: any[] = [];

  constructor(private tripService: TripService) {}

  ngOnInit() {
    this.loadFeaturedTrips();
    this.loadReviews();
  }

  loadFeaturedTrips() {
    // Load 4 nearest available trips from backend
    this.tripService.getFeaturedTrips(4).subscribe((trips) => {
      this.featuredTrips = trips;
    });
  }

  loadReviews() {
    // Load reviews from backend
    // this.reviewService.getLatestReviews(3).subscribe(reviews => {
    //   this.reviews = reviews;
    // });
  }
}
```

### 3. Trips List Component

**File:** `src/app/pages/trips/trips.component.ts`

**Key Features:**

- Display all trips (3 per row)
- Filters by:
  - Month
  - Number of days
  - Price range
- Trip cards with image, dates, price, available spots

```typescript
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { TripService } from "../../shared/services/trip.service";
import { Trip } from "../../shared/models/trip.model";

@Component({
  selector: "app-trips",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="trips-container">
      <div class="container mt-5">
        <div class="row">
          <!-- Filters Sidebar -->
          <div class="col-md-3">
            <div class="filter-panel">
              <h5>Filtri</h5>

              <!-- Month Filter -->
              <div class="filter-group mb-3">
                <label for="month">Mēnesis:</label>
                <select
                  id="month"
                  class="form-select"
                  [(ngModel)]="selectedMonth"
                  (change)="applyFilters()"
                >
                  <option value="">Visi mēneši</option>
                  <option value="1">Janvāris</option>
                  <option value="2">Februāris</option>
                  <option value="3">Marts</option>
                  <option value="4">Aprīlis</option>
                  <option value="5">Maijs</option>
                  <option value="6">Jūnijs</option>
                  <option value="7">Jūlijs</option>
                  <option value="8">Augusts</option>
                  <option value="9">Septembris</option>
                  <option value="10">Oktobris</option>
                  <option value="11">Novembris</option>
                  <option value="12">Decembris</option>
                </select>
              </div>

              <!-- Days Filter -->
              <div class="filter-group mb-3">
                <label for="days">Dienu skaits:</label>
                <select
                  id="days"
                  class="form-select"
                  [(ngModel)]="selectedDays"
                  (change)="applyFilters()"
                >
                  <option value="">Visi</option>
                  <option value="1">1-3 dienas</option>
                  <option value="4">4-7 dienas</option>
                  <option value="8">8-14 dienas</option>
                  <option value="15">15+ dienas</option>
                </select>
              </div>

              <!-- Price Filter -->
              <div class="filter-group mb-3">
                <label for="price">Cena (€):</label>
                <div class="price-range">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    [(ngModel)]="maxPrice"
                    (change)="applyFilters()"
                    class="form-range"
                  />
                  <p>Līdz: {{ maxPrice }} €</p>
                </div>
              </div>

              <button
                class="btn btn-secondary w-100 mt-3"
                (click)="resetFilters()"
              >
                Atiestatīt filtrus
              </button>
            </div>
          </div>

          <!-- Trips Grid -->
          <div class="col-md-9">
            <div class="row">
              <div class="col-md-4 mb-4" *ngFor="let trip of filteredTrips">
                <div class="trip-card h-100">
                  <img
                    [src]="trip.mainImage"
                    [alt]="trip.name"
                    class="trip-image"
                  />
                  <div class="card-body">
                    <h5 class="card-title">{{ trip.name }}</h5>
                    <p class="date-range">
                      {{ trip.startDate | date: "dd.MM.yyyy" }} -
                      {{ trip.endDate | date: "dd.MM.yyyy" }}
                    </p>
                    <p class="price">
                      <strong>{{ trip.price }} €</strong>
                    </p>
                    <p class="spots">
                      <small>Pieejamas vietas: {{ trip.availableSpots }}</small>
                    </p>
                    <button
                      class="btn btn-primary w-100"
                      (click)="selectTrip(trip)"
                    >
                      Pieteikties
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./trips.component.css"],
})
export class TripsComponent implements OnInit {
  allTrips: Trip[] = [];
  filteredTrips: Trip[] = [];
  selectedMonth: string = "";
  selectedDays: string = "";
  maxPrice: number = 5000;

  constructor(private tripService: TripService) {}

  ngOnInit() {
    this.loadTrips();
  }

  loadTrips() {
    this.tripService.getAllTrips().subscribe((trips) => {
      this.allTrips = trips;
      this.filteredTrips = trips;
    });
  }

  applyFilters() {
    this.filteredTrips = this.allTrips.filter((trip) => {
      const matchesMonth =
        !this.selectedMonth ||
        new Date(trip.startDate).getMonth() + 1 ===
          parseInt(this.selectedMonth);
      const matchesPrice = trip.price <= this.maxPrice;
      const matchesDays = this.matchesDayFilter(trip);
      return matchesMonth && matchesPrice && matchesDays;
    });
  }

  matchesDayFilter(trip: Trip): boolean {
    if (!this.selectedDays) return true;
    const days = Math.ceil(
      (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    switch (this.selectedDays) {
      case "1":
        return days >= 1 && days <= 3;
      case "4":
        return days >= 4 && days <= 7;
      case "8":
        return days >= 8 && days <= 14;
      case "15":
        return days >= 15;
      default:
        return true;
    }
  }

  resetFilters() {
    this.selectedMonth = "";
    this.selectedDays = "";
    this.maxPrice = 5000;
    this.filteredTrips = this.allTrips;
  }

  selectTrip(trip: Trip) {
    // Navigate to registration page with trip ID
    // this.router.navigate(['/registration', trip.id]);
  }
}
```

### 4. Registration Form Component

**File:** `src/app/pages/registration/registration.component.ts`

```typescript
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { TripService } from "../../shared/services/trip.service";
import { Trip } from "../../shared/models/trip.model";

@Component({
  selector: "app-registration",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="registration-container">
      <div class="container mt-5">
        <div class="row justify-content-center">
          <div class="col-md-8">
            <h2>Pieteikšanās ceļojumam</h2>

            <!-- Trip Details -->
            <div class="trip-summary card mb-4" *ngIf="trip">
              <div class="card-body">
                <h5>{{ trip.name }}</h5>
                <p>
                  {{ trip.startDate | date: "dd.MM.yyyy" }} -
                  {{ trip.endDate | date: "dd.MM.yyyy" }}
                </p>
                <p>
                  <strong>Cena: {{ trip.price }} €</strong>
                </p>
              </div>
            </div>

            <!-- Registration Form -->
            <form
              [formGroup]="registrationForm"
              (ngSubmit)="submitRegistration()"
            >
              <div class="mb-3">
                <label class="form-label">Vārds *</label>
                <input
                  type="text"
                  class="form-control"
                  formControlName="firstName"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Uzvārds *</label>
                <input
                  type="text"
                  class="form-control"
                  formControlName="lastName"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">E-pasts *</label>
                <input
                  type="email"
                  class="form-control"
                  formControlName="email"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Telefons *</label>
                <input
                  type="tel"
                  class="form-control"
                  formControlName="phone"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Personas kods (neobligāti)</label>
                <input
                  type="text"
                  class="form-control"
                  formControlName="personalId"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Pases numurs (neobligāti)</label>
                <input
                  type="text"
                  class="form-control"
                  formControlName="passportNumber"
                />
              </div>

              <div class="mb-3">
                <label class="form-label"
                  >Pases derīguma termiņš (neobligāti)</label
                >
                <input
                  type="date"
                  class="form-control"
                  formControlName="passportExpiryDate"
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary btn-lg w-100"
                [disabled]="!registrationForm.valid"
              >
                Turpināt uz maksājumu
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./registration.component.css"],
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  trip?: Trip;

  constructor(
    private formBuilder: FormBuilder,
    private tripService: TripService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.registrationForm = this.formBuilder.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", Validators.required],
      personalId: [""],
      passportNumber: [""],
      passportExpiryDate: [""],
    });
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params["tripId"]) {
        this.loadTrip(params["tripId"]);
      }
    });
  }

  loadTrip(tripId: string) {
    this.tripService.getTrip(tripId).subscribe((trip) => {
      this.trip = trip;
    });
  }

  submitRegistration() {
    if (this.registrationForm.valid && this.trip) {
      const registration = {
        tripId: this.trip.id,
        ...this.registrationForm.value,
      };

      // Call backend to create registration and initiate payment
      // this.paymentService.createRegistration(registration).subscribe(response => {
      //   this.router.navigate(['/payment', response.id]);
      // });
    }
  }
}
```

### 5. Admin Login Component

**File:** `src/app/admin/login/admin-login.component.ts`

```typescript
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../shared/services/auth.service";

@Component({
  selector: "app-admin-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-login-container">
      <div class="container mt-5">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="card">
              <div class="card-body">
                <h2 class="card-title text-center mb-4">Admin Pieeja</h2>

                <div *ngIf="error" class="alert alert-danger">
                  {{ error }}
                </div>

                <form (ngSubmit)="login()" #loginForm="ngForm">
                  <div class="mb-3">
                    <label for="email" class="form-label">E-pasts</label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      name="email"
                      [(ngModel)]="email"
                      required
                    />
                  </div>

                  <div class="mb-3">
                    <label for="password" class="form-label">Parole</label>
                    <input
                      type="password"
                      class="form-control"
                      id="password"
                      name="password"
                      [(ngModel)]="password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    class="btn btn-primary w-100"
                    [disabled]="isLoading"
                  >
                    {{ isLoading ? "Ieiet..." : "Ieiet" }}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./admin-login.component.css"],
})
export class AdminLoginComponent {
  email = "";
  password = "";
  error = "";
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  login() {
    this.isLoading = true;
    this.error = "";

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        localStorage.setItem("adminToken", response.token);
        this.router.navigate(["/admin/dashboard"]);
      },
      error: (err) => {
        this.error = "Nepareizs e-pasts vai parole";
        this.isLoading = false;
      },
    });
  }
}
```

### 6. Admin Dashboard Component

**File:** `src/app/admin/dashboard/admin-dashboard.component.ts`

```typescript
import { Component, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../shared/services/auth.service";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-dashboard">
      <nav class="navbar bg-dark text-white">
        <div class="container-fluid">
          <span class="navbar-brand mb-0 h1">Admin Panelis</span>
          <button class="btn btn-outline-light" (click)="logout()">
            Izlogoties
          </button>
        </div>
      </nav>

      <div class="container-fluid mt-4">
        <div class="row">
          <!-- Sidebar -->
          <div class="col-md-3">
            <div class="list-group">
              <a
                routerLink="/admin/trips"
                class="list-group-item list-group-item-action"
                routerLinkActive="active"
              >
                Ceļojumu pārvaldīšana
              </a>
              <a
                routerLink="/admin/registrations"
                class="list-group-item list-group-item-action"
                routerLinkActive="active"
              >
                Pieteikšanās
              </a>
              <a
                routerLink="/admin/payments"
                class="list-group-item list-group-item-action"
                routerLinkActive="active"
              >
                Maksājumi
              </a>
              <a
                routerLink="/admin/reviews"
                class="list-group-item list-group-item-action"
                routerLinkActive="active"
              >
                Atsauksmes
              </a>
            </div>
          </div>

          <!-- Main Content -->
          <div class="col-md-9">
            <h2>Laipni lūgts Admin Panelī</h2>
            <p>Izvēlieties darbību no kreisajās sānjoslas.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./admin-dashboard.component.css"],
})
export class AdminDashboardComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(["/"]);
  }
}
```

---

## Implementation Steps

### Step 1: Setup & Project Initialization

- [ ] Create Angular project
- [ ] Install dependencies
- [ ] Setup routing configuration
- [ ] Configure Bootstrap/CSS framework

### Step 2: Create Shared Services

- [ ] `TripService` - fetch/manage trips
- [ ] `PaymentService` - handle payments
- [ ] `AuthService` - admin authentication
- [ ] `ReviewService` - manage reviews
- [ ] `FAQService` - manage FAQs

### Step 3: Build Shared Components

- [ ] `NavbarComponent` - navigation with 5 menu items
- [ ] `FooterComponent` - footer with contact info
- [ ] Models/interfaces for all entities

### Step 4: Build Landing Page

- [ ] Featured trips section (4 trips)
- [ ] About section
- [ ] Reviews section
- [ ] "View All" button

### Step 5: Build Trips Section

- [ ] Trips list (3 per row)
- [ ] Filter sidebar (month, days, price)
- [ ] Trip cards with details
- [ ] "Pieteikties" button functionality

### Step 6: Build Other Pages

- [ ] About page (Par Brīva diena)
- [ ] Contacts page (with contact form)
- [ ] Reviews page (full reviews list)
- [ ] FAQ page (Q&A section)

### Step 7: Build Registration Flow

- [ ] Registration form component
- [ ] Form validation
- [ ] Integration with backend
- [ ] Payment flow initiation

### Step 8: Build Admin Section

- [ ] Admin login page
- [ ] Authentication service/guard
- [ ] Admin dashboard
- [ ] Trip management (CRUD)
- [ ] Registration/payment viewing

### Step 9: Styling & Responsive Design

- [ ] Global styles (CSS/SCSS)
- [ ] Component-specific styles
- [ ] Mobile responsiveness
- [ ] Accessibility improvements

### Step 10: Testing & Deployment

- [ ] Unit tests
- [ ] E2E tests
- [ ] Build optimization
- [ ] Deployment configuration

---

## API Integration

### Required Backend Endpoints

**Trips**

```
GET /api/trips - Get all trips (with optional filters)
GET /api/trips/{id} - Get trip details
POST /api/trips (admin) - Create trip
PUT /api/trips/{id} (admin) - Update trip
DELETE /api/trips/{id} (admin) - Delete trip
```

**Registrations**

```
POST /api/registrations - Create registration
GET /api/registrations/{id} - Get registration details
GET /api/admin/registrations (admin) - List all registrations
```

**Payments**

```
POST /api/payments - Initiate payment
GET /api/payments/{id} - Get payment status
GET /api/admin/payments (admin) - List all payments
POST /api/webhooks/stripe - Stripe webhook
```

**Reviews**

```
GET /api/reviews - Get all reviews
GET /api/reviews/latest - Get latest reviews (for landing page)
POST /api/reviews - Submit review (optional)
GET /api/admin/reviews (admin) - Manage reviews
```

**Admin**

```
POST /api/admin/login - Admin login
GET /api/admin/profile - Get admin profile
POST /api/admin/logout - Logout
```

---

## Admin Panel

The admin panel should include:

### Dashboard

- Overview of recent registrations
- Recent payments
- Statistics (total revenue, trips booked, etc.)

### Trip Management

- List all trips with ability to edit/delete
- Create new trips form
- Upload trip images
- Set availability and pricing

### Registrations

- List all customer registrations
- View registration details
- Filter by trip/date range
- Export to CSV

### Payments

- View payment status
- Manage payment records
- Refund handling
- Revenue reports

### Reviews Management

- List all reviews
- Approve/reject reviews
- Respond to reviews

---

## Security Considerations

1. **Admin Authentication**
   - Use JWT tokens for admin login
   - Implement token refresh mechanism
   - Store tokens securely (httpOnly cookies preferred)

2. **Route Protection**
   - Create `AuthGuard` to protect admin routes
   - Redirect unauthorized users to login

3. **Payment Security**
   - Never handle sensitive payment data on frontend
   - Use Stripe Elements for card input
   - Validate all inputs server-side

4. **CORS & Security Headers**
   - Configure CORS properly in backend
   - Implement Content-Security-Policy headers
   - Use HTTPS in production

---

## Running the Application

```bash
# Development server
ng serve --host 0.0.0.0 --port 4200

# Open browser
# http://localhost:4200

# Production build
ng build --configuration production

# Run tests
ng test
```

---

## Next Steps

1. Start with Step 1: Project initialization
2. Create the shared services and models
3. Build the navbar and landing page
4. Implement the trips listing and filtering
5. Create the registration and payment flow
6. Build the admin panel
7. Integrate with existing Spring Boot backend
8. Test thoroughly before deployment

---

**Last Updated:** April 5, 2026
**Language:** Latvian (lv) Frontend with Instructions in English
