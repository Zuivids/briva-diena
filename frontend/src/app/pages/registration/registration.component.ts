import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TripService } from '../../shared/services/trip.service';
import { RegistrationService } from '../../shared/services/registration.service';
import { Trip } from '../../shared/models/trip.model';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  template: `
    <div class="reg-page">
      <div class="container py-5">

        <!-- Success State -->
        <div *ngIf="success" class="success-card mx-auto">
          <div class="success-icon">&#10003;</div>
          <h2 class="success-title">Paldies par pieteikumu!</h2>
          <p class="success-text">Tavs pieteikums ir saņemts! Tuvākās darba dienas laikā Tu saņemtsi epastā rēķinu par ceļojumu un līgumu. Jautājumu gadījumā raksti: info&#64;brivadiena.lv vai 29784777</p>
          <a routerLink="/trips" class="btn btn-primary mt-2">Atpakaļ uz ceļojumiem</a>
        </div>

        <!-- Form -->
        <div *ngIf="!success" class="reg-card mx-auto">

          <!-- Header -->
          <div class="reg-header">
            <h2 class="reg-title">Pieteikšanās ceļojumam</h2>
            <p *ngIf="trip" class="reg-subtitle">{{ trip.name }} &nbsp;&bull;&nbsp; {{ trip.startDate | date:'dd.MM.yyyy' }} &ndash; {{ trip.endDate | date:'dd.MM.yyyy' }}</p>
          </div>

          <!-- Trip selector -->
          <div class="trip-selector-wrap" *ngIf="trips.length > 1">
            <label class="field-label mb-1">Mainīt ceļojumu</label>
            <select class="form-select field-input" [(ngModel)]="selectedTripId" (ngModelChange)="onTripChange($event)" [ngModelOptions]="{standalone: true}">
              <option *ngFor="let t of trips" [value]="t.id">{{ t.name }} ({{ t.startDate | date:'dd.MM.yyyy' }})</option>
            </select>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>

            <!-- Personal Info -->
            <div class="form-section">
              <h5 class="section-label">Personas dati</h5>
              <div class="row g-3">
                <div class="col-sm-6">
                  <label class="field-label">Vārds <span class="req">*</span></label>
                  <input formControlName="firstName" type="text" class="form-control field-input"
                    [class.is-invalid]="submitted && f['firstName'].errors" placeholder="Jānis" />
                  <div *ngIf="submitted && f['firstName'].errors" class="invalid-feedback">
                    Lūdzu ievadiet vārdu.
                  </div>
                </div>
                <div class="col-sm-6">
                  <label class="field-label">Uzvārds <span class="req">*</span></label>
                  <input formControlName="lastName" type="text" class="form-control field-input"
                    [class.is-invalid]="submitted && f['lastName'].errors" placeholder="Bērziņš" />
                  <div *ngIf="submitted && f['lastName'].errors" class="invalid-feedback">
                    Lūdzu ievadiet uzvārdu.
                  </div>
                </div>
                <div class="col-sm-6">
                  <label class="field-label">Telefons <span class="req">*</span></label>
                  <input formControlName="phone" type="tel" class="form-control field-input"
                    [class.is-invalid]="submitted && f['phone'].errors" placeholder="+371 20000000" />
                  <div *ngIf="submitted && f['phone'].errors" class="invalid-feedback">
                    Lūdzu ievadiet derīgu tālruņa numuru.
                  </div>
                </div>
                <div class="col-sm-6">
                  <label class="field-label">E-pasts <span class="req">*</span></label>
                  <input formControlName="email" type="email" class="form-control field-input"
                    [class.is-invalid]="submitted && f['email'].errors" placeholder="janis@example.lv" />
                  <div *ngIf="submitted && f['email'].errors" class="invalid-feedback">
                    Lūdzu ievadiet derīgu e-pasta adresi.
                  </div>
                </div>
              </div>
            </div>

            <!-- Identification -->
            <div class="form-section">
              <h5 class="section-label">Identifikācija</h5>
              <div class="row g-3">
                <div class="col-12">
                  <label class="field-label">Personas kods <span class="req">*</span></label>
                  <input formControlName="personalIdNumber" type="text" class="form-control field-input"
                    [class.is-invalid]="submitted && f['personalIdNumber'].errors" placeholder="XXXXXX-XXXXX" />
                  <div *ngIf="submitted && f['personalIdNumber'].errors" class="invalid-feedback">
                    Lūdzu ievadiet personas kodu.
                  </div>
                </div>
                <div class="col-sm-6">
                  <label class="field-label">ID vai pases numurs <span class="optional">(nav obligāts)</span></label>
                  <input formControlName="passportNumber" type="text" class="form-control field-input"
                    placeholder="AB1234567" />
                </div>
                <div class="col-sm-6">
                  <label class="field-label">Derīguma termiņš <span class="optional">(nav obligāts)</span></label>
                  <input formControlName="passportExpiryDate" type="date" class="form-control field-input" />
                </div>
              </div>
            </div>

            <!-- Consents -->
            <div class="form-section">
              <h5 class="section-label">Piekrišanas</h5>
              <div class="consent-block" [class.consent-error]="submitted && f['privacyConsent'].errors">
                <label class="consent-label">
                  <input formControlName="privacyConsent" type="checkbox" class="consent-checkbox" />
                  <span>
                    Piekrītu manu datu apstrādei un
                    <a routerLink="/policies/privacy-policy" target="_blank" class="policy-link">privātuma politikai</a>
                    <span class="req"> *</span>
                  </span>
                </label>
                <div *ngIf="submitted && f['privacyConsent'].errors" class="consent-error-msg">
                  Jums jāpiekrīt privātuma politikai.
                </div>
              </div>

              <div class="consent-block" [class.consent-error]="submitted && f['travelAgreement'].errors">
                <label class="consent-label">
                  <input formControlName="travelAgreement" type="checkbox" class="consent-checkbox" />
                  <span>
                    Piekrītu ceļošanas līgumam. Ceļotājs apliecina, ka ir iepazinies ar līguma noteikumiem
                    un tiem piekrīt pilnā apmērā, veicot avansa maksājumu. Avansa maksājuma veikšana tiek
                    uzskatīta par Ceļotāja nepārprotamu piekrišanu šī līguma noteikumiem un ir juridiski
                    saistoša. Līgums uzskatāms par noslēgtu brīdī, kad Tūrisma operators ir saņēmis avansa
                    maksājumu.
                    <span class="req"> *</span>
                  </span>
                </label>
                <div *ngIf="submitted && f['travelAgreement'].errors" class="consent-error-msg">
                  Jums jāpiekrīt ceļošanas līgumam.
                </div>
              </div>
            </div>

            <!-- Error -->
            <div *ngIf="error" class="alert alert-danger py-2 small">{{ error }}</div>

            <!-- Submit -->
            <div class="d-flex align-items-center gap-3 mt-2">
              <button type="submit" class="btn btn-submit" [disabled]="loading">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                Iesniegt pieteikumu
              </button>
              <a routerLink="/trips" class="btn btn-link-cancel">Atcelt</a>
            </div>

          </form>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .reg-page {
      min-height: 100vh;
      background: #f4f6fb;
    }

    .reg-card, .success-card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(23, 70, 160, 0.09);
      max-width: 680px;
      overflow: hidden;
    }

    .reg-header {
      background: linear-gradient(135deg, #1746a0 0%, #2563d4 100%);
      padding: 28px 36px 24px;
    }

    .reg-title {
      color: #fff;
      font-size: 1.45rem;
      font-weight: 700;
      margin: 0 0 4px;
    }

    .reg-subtitle {
      color: rgba(255,255,255,0.82);
      font-size: 0.9rem;
      margin: 0;
    }

    form {
      padding: 28px 36px 32px;
    }

    .form-section {
      margin-bottom: 28px;
    }

    .section-label {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #1746a0;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e8eef8;
    }

    .field-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 5px;
      display: block;
    }

    .req {
      color: #e84040;
    }

    .optional {
      font-weight: 400;
      color: #9ca3af;
      font-size: 0.78rem;
    }

    .field-input {
      border: 1.5px solid #d1d9ee;
      border-radius: 8px;
      padding: 9px 13px;
      font-size: 0.9rem;
      transition: border-color 0.18s, box-shadow 0.18s;
    }

    .field-input:focus {
      border-color: #1746a0;
      box-shadow: 0 0 0 3px rgba(23, 70, 160, 0.12);
    }

    .field-input.is-invalid {
      border-color: #e84040;
    }

    .invalid-feedback {
      font-size: 0.78rem;
    }

    /* Consents */
    .consent-block {
      background: #f8faff;
      border: 1.5px solid #e2e8f5;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 12px;
      transition: border-color 0.18s;
    }

    .consent-block.consent-error {
      border-color: #e84040;
      background: #fff8f8;
    }

    .consent-label {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      cursor: pointer;
      font-size: 0.86rem;
      color: #374151;
      line-height: 1.55;
      margin: 0;
    }

    .consent-checkbox {
      flex-shrink: 0;
      width: 17px;
      height: 17px;
      margin-top: 2px;
      accent-color: #1746a0;
      cursor: pointer;
    }

    .policy-link {
      color: #1746a0;
      text-decoration: underline;
      font-weight: 600;
    }

    .policy-link:hover {
      color: #0f34a0;
    }

    .consent-error-msg {
      color: #e84040;
      font-size: 0.76rem;
      margin-top: 6px;
      padding-left: 27px;
    }

    /* Submit */
    .btn-submit {
      background: #1746a0;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 10px 28px;
      font-size: 0.95rem;
      font-weight: 600;
      transition: background 0.18s;
    }

    .btn-submit:hover:not(:disabled) {
      background: #0f34a0;
      color: #fff;
    }

    .btn-submit:disabled {
      opacity: 0.65;
    }

    .btn-link-cancel {
      color: #6b7280;
      font-size: 0.88rem;
      text-decoration: none;
      padding: 0;
    }

    .btn-link-cancel:hover {
      color: #374151;
    }

    /* Success */
    .success-card {
      text-align: center;
      padding: 56px 40px;
    }

    .success-icon {
      width: 64px;
      height: 64px;
      background: #22c55e;
      color: #fff;
      border-radius: 50%;
      font-size: 2rem;
      line-height: 64px;
      margin: 0 auto 20px;
    }

    .success-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 10px;
    }

    .success-text {
      color: #6b7280;
      font-size: 0.95rem;
      max-width: 400px;
      margin: 0 auto;
    }

    .trip-selector-wrap {
      padding: 16px 36px 0;
    }

    @media (max-width: 576px) {
      .reg-header { padding: 22px 20px 18px; }
      form { padding: 20px 16px 24px; }
      .trip-selector-wrap { padding: 12px 16px 0; }
    }
  `]
})
export class RegistrationComponent implements OnInit {
  form: FormGroup;
  trip: Trip | null = null;
  trips: Trip[] = [];
  selectedTripId = '';
  loading = false;
  submitted = false;
  success = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private tripService: TripService,
    private registrationService: RegistrationService
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-]{7,20}$/)]],
      email: ['', [Validators.required, Validators.email]],
      personalIdNumber: ['', Validators.required],
      passportNumber: [''],
      passportExpiryDate: [''],
      privacyConsent: [false, Validators.requiredTrue],
      travelAgreement: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    const tripId = this.route.snapshot.paramMap.get('tripId') || '';
    this.selectedTripId = tripId;
    if (tripId) {
      this.tripService.getTrip(tripId).subscribe({
        next: (trip) => this.trip = trip,
        error: () => {}
      });
    }
    this.tripService.getAllTrips().subscribe({
      next: (trips) => { this.trips = trips; },
      error: () => {}
    });
  }

  onTripChange(tripId: string): void {
    this.selectedTripId = tripId;
    this.error = '';
    this.tripService.getTrip(tripId).subscribe({
      next: (trip) => this.trip = trip,
      error: () => {}
    });
  }

  get f() { return this.form.controls; }

  submit(): void {
    this.submitted = true;
    this.error = '';
    if (this.form.invalid) return;

    this.loading = true;
    const tripId = this.selectedTripId || this.route.snapshot.paramMap.get('tripId') || '';
    const v = this.form.value;

    this.registrationService.createRegistration({
      tripId,
      firstName: v.firstName,
      lastName: v.lastName,
      phone: v.phone,
      email: v.email,
      personalId: v.personalIdNumber,
      passportNumber: v.passportNumber || undefined,
      passportExpiryDate: v.passportExpiryDate || undefined
    }).subscribe({
      next: () => { this.loading = false; this.success = true; },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.error = 'Šis ceļojums ir pilns. Diemžēl nav brīvu vietu.';
        } else {
          this.error = 'Kļūda piesakoties. Lūdzu, mēģiniet vēlāk.';
        }
      }
    });
  }
}
