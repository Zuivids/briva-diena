import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TripService } from '../../shared/services/trip.service';
import { AdminStateService } from '../../shared/services/admin-state.service';
import { Trip } from '../../shared/models/trip.model';

interface FormDay {
  dayNumber: number;
  date: string;
  description: string;
  imageFile: File | null;
  imagePreview: string | null;
  existingImagePath: string | null;
}

interface TripForm {
  name: string;
  startDate: string;
  endDate: string;
  priceEur: number;
  availableSpots: number;
  transportationType: string;
  accommodation: string;
  airlineCompany: string;
  includedBaggageSize: string;
  groupSize: number;
  priceIncluded: string;
  extraCharge: string;
  description: string;
  paymentInfo: string;
  landingSection: string;
}

@Component({
  selector: 'app-trip-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="tm-page">

      <div class="container py-4">

        <!-- ── Existing trips ── -->
        <section class="admin-section" *ngIf="!showForm">
          <div class="section-top-row">
            <h4 class="section-heading">Esošie ceļojumi</h4>
            <button class="btn btn-primary btn-sm" (click)="openCreateForm()">+ Pievienot ceļojumu</button>
          </div>

          <!-- ── Filters ── -->
          <div class="admin-filters" *ngIf="!loadingTrips && trips.length > 0">
            <div class="af-field">
              <label class="af-label">Nosaukums</label>
              <input type="text" class="form-control form-control-sm" placeholder="Meklēt..." [(ngModel)]="filterName" />
            </div>
            <div class="af-field">
              <label class="af-label">Sākuma datums</label>
              <input type="date" class="form-control form-control-sm" [(ngModel)]="filterStartDate" />
            </div>
            <div class="af-field">
              <label class="af-label">Beigu datums</label>
              <input type="date" class="form-control form-control-sm" [(ngModel)]="filterEndDate" />
            </div>
            <div class="af-field">
              <label class="af-label">Ilgums (dienas)</label>
              <input type="number" class="form-control form-control-sm" placeholder="piem., 7" min="1" [(ngModel)]="filterDuration" />
            </div>
            <button class="btn btn-sm btn-outline-secondary" (click)="clearAdminFilters()" *ngIf="hasAdminFilters">Notīrīt</button>
          </div>

          <div *ngIf="loadingTrips" class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-primary"></div>
          </div>

          <div *ngIf="!loadingTrips && filteredTrips.length === 0" class="text-muted py-3 text-center">
            {{ trips.length === 0 ? 'Nav pievienotu ceļojumu.' : 'Nav ceļojumu, kas atbilst filtriem.' }}
          </div>

          <div class="trips-list" *ngIf="!loadingTrips && filteredTrips.length > 0">
            <div *ngFor="let trip of filteredTrips" class="trip-list-item">
              <div class="trip-list-info">
                <strong class="trip-list-name">{{ trip.name }}</strong>
                <div class="trip-list-meta">
                  <span class="badge bg-secondary">{{ trip.startDate | date:'dd.MM.yyyy' }} – {{ trip.endDate | date:'dd.MM.yyyy' }}</span>
                  <span class="badge bg-primary">€{{ (trip.priceCents / 100) | number:'1.0-0' }}</span>
                  <span class="badge bg-light text-dark">{{ trip.availableSpots }} vietas</span>
                  <span *ngIf="trip.landingSection === 'TOP'" class="badge bg-success">TOP</span>
                  <span *ngIf="trip.landingSection === 'LAST_CHANCE'" class="badge bg-warning text-dark">Pēdējā iespēja</span>
                  <span *ngIf="trip.hidden" class="badge bg-danger">Noslēpts</span>
                </div>
              </div>
              <div class="trip-list-actions">
                <a [routerLink]="['/trip', trip.id]" class="btn btn-sm btn-outline-secondary" target="_blank">Apskatīt</a>
                <button class="btn btn-sm btn-outline-primary" (click)="openEditForm(trip)">Rediģēt</button>
                <button class="btn btn-sm btn-outline-info" (click)="copyTrip(trip)">Kopēt</button>
                <button class="btn btn-sm" [ngClass]="trip.hidden ? 'btn-warning' : 'btn-outline-secondary'" (click)="toggleHidden(trip)">{{ trip.hidden ? 'Parādīt' : 'Noslēpt' }}</button>
                <button class="btn btn-sm btn-outline-danger" (click)="deleteTrip(String(trip.id))">Dzēst</button>
              </div>
            </div>
          </div>
        </section>

        <!-- ── Create / Edit form ── -->
        <section class="admin-section" *ngIf="showForm">
          <div class="section-top-row mb-4">
            <h4 class="section-heading">{{ editingTripId ? 'Rediģēt ceļojumu' : 'Jauns ceļojums' }}</h4>
            <button class="btn btn-sm btn-outline-secondary" (click)="cancelForm()">✕ Atcelt</button>
          </div>

          <!-- Success -->
          <div *ngIf="saveSuccess" class="alert alert-success py-2 mb-3">{{ saveSuccess }}</div>
          <!-- Error -->
          <div *ngIf="saveError" class="alert alert-danger py-2 mb-3">{{ saveError }}</div>

          <!-- Progress bar -->
          <div *ngIf="saving" class="mb-3">
            <div class="progress" style="height:6px">
              <div class="progress-bar progress-bar-striped progress-bar-animated"
                   [style.width]="saveProgress + '%'"></div>
            </div>
            <small class="text-muted">Saglabā... {{ saveProgress }}%</small>
          </div>

          <!-- ── 1. Cover photo ── -->
          <div class="form-section">
            <h5 class="section-label">1. Titulfoto</h5>
            <div class="photo-upload-area">
              <div *ngIf="coverPhotoPreview" class="cover-preview">
                <img [src]="coverPhotoPreview" alt="Cover preview" />
              </div>
              <div *ngIf="!coverPhotoPreview" class="cover-placeholder">
                <span>Nav izvēlēts attēls</span>
              </div>
              <label class="btn btn-outline-primary btn-sm mt-2 upload-label">
                {{ coverPhotoPreview ? 'Mainīt titulfoto' : 'Izvēlēties titulfoto' }}
                <input type="file" accept="image/*" class="visually-hidden" (change)="onCoverPhotoChange($event)" />
              </label>
            </div>
          </div>

          <!-- ── 2. Trip name ── -->
          <div class="form-section">
            <h5 class="section-label">2. Ceļojuma nosaukums</h5>
            <input type="text" [(ngModel)]="form.name" name="name"
                   class="form-control field-input" placeholder="piem., Itālija — Toskāna un Roma" />
          </div>

          <!-- ── 3. Dates ── -->
          <div class="form-section">
            <h5 class="section-label">3. Datumi</h5>
            <div class="row g-3">
              <div class="col-sm-6">
                <label class="field-label">No datuma <span class="req">*</span></label>
                <input type="date" [(ngModel)]="form.startDate" name="startDate" class="form-control field-input" (ngModelChange)="onStartDateChange($event)" />
              </div>
              <div class="col-sm-6">
                <label class="field-label">Līdz datumam <span class="req">*</span></label>
                <input type="date" [(ngModel)]="form.endDate" name="endDate" class="form-control field-input" />
              </div>
            </div>
          </div>

          <!-- ── 4. Price ── -->
          <div class="form-section">
            <h5 class="section-label">4. Cena</h5>
            <div class="input-group" style="max-width:220px">
              <span class="input-group-text">€</span>
              <input type="number" [(ngModel)]="form.priceEur" name="priceEur"
                     class="form-control field-input" min="0" step="0.01" placeholder="1899" />
            </div>
          </div>

          <!-- ── 5. Duration / Available spots / Group size ── -->
          <div class="form-section">
            <h5 class="section-label">5. Ilgums, vietas un grupas izmērs</h5>
            <div class="row g-3">
              <div class="col-md-4">
                <label class="field-label">Ceļojuma ilgums (dienas)</label>
                <div class="form-control field-input bg-light text-muted" style="cursor:default">
                  {{ durationDays > 0 ? durationDays + ' dienas' : '—' }}
                </div>
                <small class="text-muted">Aprēķināts automātiski no datumiem</small>
              </div>
              <div class="col-md-4">
                <label class="field-label">Brīvās vietas <span class="req">*</span></label>
                <input type="number" [(ngModel)]="form.availableSpots" name="availableSpots"
                       class="form-control field-input" min="0" placeholder="20" />
              </div>
              <div class="col-md-4">
                <label class="field-label">Grupas izmērs (cilvēki)</label>
                <input type="number" [(ngModel)]="form.groupSize" name="groupSize"
                       class="form-control field-input" min="0" placeholder="piem., 15" />
              </div>
            </div>
          </div>

          <!-- ── 6. Transport / Accommodation ── -->
          <div class="form-section">
            <h5 class="section-label">6. Transports un izmitināšana</h5>
            <div class="row g-3">
              <div class="col-sm-6">
                <label class="field-label">Pārvietošanās</label>
                <input type="text" [(ngModel)]="form.transportationType" name="transportationType"
                       class="form-control field-input" placeholder="piem., privātais transfers, publiskie kuģīši" />
              </div>
              <div class="col-sm-6">
                <label class="field-label">Naktsmītnes</label>
                <input type="text" [(ngModel)]="form.accommodation" name="accommodation"
                       class="form-control field-input" placeholder="piem., viesnīca numuriņos pa divi" />
              </div>
            </div>
          </div>

          <!-- ── 7. Airline / Baggage ── -->
          <div class="form-section">
            <h5 class="section-label">7. Aviokompānija un bagāža</h5>
            <div class="row g-3">
              <div class="col-sm-6">
                <label class="field-label">Aviokompānija</label>
                <input type="text" [(ngModel)]="form.airlineCompany" name="airlineCompany"
                       class="form-control field-input" placeholder="piem., Ryanair" />
              </div>
              <div class="col-sm-6">
                <label class="field-label">Iekļautā bagāžas norma</label>
                <input type="text" [(ngModel)]="form.includedBaggageSize" name="includedBaggageSize"
                       class="form-control field-input" placeholder="piem., 8 kg rokas bagāža" />
              </div>
            </div>
          </div>

          <!-- ── 8. Price included / Extra charge ── -->
          <div class="form-section">
            <h5 class="section-label">8. Iekļauts cenā un Papildus izmaksas</h5>
            <div class="row g-4">
              <div class="col-sm-6">
                <label class="field-label">Iekļauts cenā</label>
                <div *ngFor="let item of priceIncludedItems; let i = index; trackBy: trackByIndex" class="flight-entry-row">
                  <input type="text" [(ngModel)]="priceIncludedItems[i]" [name]="'priceIncluded' + i"
                         class="form-control field-input" placeholder="piem., Avioreisi" />
                  <button *ngIf="priceIncludedItems.length > 1" type="button"
                          class="btn btn-sm btn-outline-danger ms-2"
                          (click)="removePriceIncluded(i)">✕</button>
                </div>
                <button type="button" class="btn btn-outline-success btn-sm mt-2" (click)="addPriceIncluded()">+ Pievienot</button>
              </div>
              <div class="col-sm-6">
                <label class="field-label">Papildus izmaksas</label>
                <div *ngFor="let item of extraChargeItems; let i = index; trackBy: trackByIndex" class="flight-entry-row">
                  <input type="text" [(ngModel)]="extraChargeItems[i]" [name]="'extraCharge' + i"
                         class="form-control field-input" placeholder="piem., Pārbaudīta bagāža" />
                  <button *ngIf="extraChargeItems.length > 1" type="button"
                          class="btn btn-sm btn-outline-danger ms-2"
                          (click)="removeExtraCharge(i)">✕</button>
                </div>
                <button type="button" class="btn btn-outline-danger btn-sm mt-2" (click)="addExtraCharge()">+ Pievienot</button>
              </div>
            </div>
          </div>

          <!-- ── 9. Ko mēs piedzīvosim ── -->
          <div class="form-section">
            <h5 class="section-label">9. Ko mēs piedzīvosim</h5>
            <textarea [(ngModel)]="form.description" name="description"
                      class="form-control field-input" rows="5"
                      placeholder="Aprakstiet ceļojuma galvenos iespaidus un pieredzi..."></textarea>
          </div>

          <!-- ── 10. Itinerary days ── -->
          <div class="form-section">
            <h5 class="section-label">10.Ceļojuma dienas apraksts</h5>

            <div *ngFor="let day of days; let i = index" class="day-card">
              <div class="day-card-header">
                <span class="day-badge">{{ i + 1 }}. diena</span>
                <button *ngIf="i > 0" type="button" class="btn btn-sm btn-outline-danger btn-remove-day"
                        (click)="removeDay(i)">✕ Noņemt</button>
              </div>
              <div class="row g-3">
                <div class="col-sm-4">
                  <label class="field-label">Datums</label>
                  <input type="date" [(ngModel)]="day.date" [name]="'dayDate' + i"
                         class="form-control field-input" />
                </div>
                <div class="col-sm-8">
                  <label class="field-label">Apraksts</label>
                  <textarea [(ngModel)]="day.description" [name]="'dayDesc' + i"
                            class="form-control field-input" rows="3"
                            [placeholder]="'Aprakstiet ' + (i+1) + '. dienas aktivitātes...'"></textarea>
                </div>
                <div class="col-12">
                  <label class="field-label">Dienas foto <span class="optional">(nav obligāts)</span></label>
                  <div class="day-photo-row">
                    <div *ngIf="day.imagePreview || day.existingImagePath" class="day-photo-thumb">
                      <img [src]="day.imagePreview || (imageBase + day.existingImagePath)" alt="Day photo" />
                    </div>
                    <label class="btn btn-outline-secondary btn-sm upload-label">
                      {{ day.imagePreview || day.existingImagePath ? 'Mainīt foto' : 'Pievienot foto' }}
                      <input type="file" accept="image/*" class="visually-hidden"
                             (change)="onDayImageChange($event, i)" />
                    </label>
                    <button *ngIf="day.imagePreview || day.existingImagePath"
                            type="button" class="btn btn-sm btn-outline-danger ms-2"
                            (click)="removeDayImage(i)">✕</button>
                  </div>
                </div>
              </div>
            </div>

            <button type="button" class="btn btn-outline-primary btn-sm mt-3" (click)="addDay()">
              + Pievienot vēl dienu
            </button>
          </div>

          <!-- ── 11. Flight schedule ── -->
          <div class="form-section">
            <h5 class="section-label">11. Lidojumu datumi un laiki</h5>

            <div *ngFor="let entry of flightSchedules; let i = index" class="flight-entry-row">
              <input type="text" [(ngModel)]="flightSchedules[i]" [name]="'flight' + i"
                     class="form-control field-input"
                     placeholder="piem., Rīga – Milāna (08:25 – 10:10) 13.06.2026" />
              <button *ngIf="flightSchedules.length > 1" type="button"
                      class="btn btn-sm btn-outline-danger ms-2"
                      (click)="removeFlightEntry(i)">✕</button>
            </div>

            <button type="button" class="btn btn-outline-primary btn-sm mt-3" (click)="addFlightEntry()">
              + Pievienot lidojumu
            </button>
          </div>

          <!-- ── 12. Apmaksas kārtība ── -->
          <div class="form-section">
            <h5 class="section-label">12. Apmaksas kārtība</h5>
            <textarea [(ngModel)]="form.paymentInfo" name="paymentInfo"
                      class="form-control field-input" rows="5"
                      placeholder="Aprakstiet apmaksas kārtību..."></textarea>
          </div>

          <!-- ── 13. Additional photos ── -->
          <div class="form-section">
            <h5 class="section-label">13. Papildu foto galerija</h5>
            <div class="additional-photos-grid">
              <div *ngFor="let img of existingAdditionalImages; let i = index" class="add-photo-thumb">
                <img [src]="'/images/' + img.path" alt="Photo {{i+1}}" />
                <button type="button" class="remove-photo-btn" (click)="removeExistingAdditionalImage(i)">✕</button>
              </div>
              <div *ngFor="let preview of additionalPhotoPreviews; let i = index" class="add-photo-thumb">
                <img [src]="preview" alt="New photo {{i+1}}" />
                <button type="button" class="remove-photo-btn" (click)="removeAdditionalPhoto(i)">✕</button>
              </div>
              <label class="add-photo-add-btn upload-label">
                <span>+ Pievienot<br/>foto</span>
                <input type="file" accept="image/*" multiple class="visually-hidden"
                       (change)="onAdditionalPhotosChange($event)" />
              </label>
            </div>
          </div>

          <!-- ── Admin: Landing section ── -->
          <div class="form-section">
            <h5 class="section-label">Rādīt sākumlapā</h5>
            <select [(ngModel)]="form.landingSection" name="landingSection" class="form-select field-input" style="max-width:280px">
              <option value="">Nerādīt</option>
              <option value="TOP">Gaidāmie ceļojumi</option>
              <option value="LAST_CHANCE">Pēdējā iespēja</option>
            </select>
          </div>

          <!-- ── Submit ── -->
          <div class="form-actions">
            <button type="button" class="btn btn-primary btn-save" (click)="saveTrip()" [disabled]="saving">
              <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving ? 'Saglabā...' : (editingTripId ? 'Atjaunināt ceļojumu' : 'Saglabāt ceļojumu') }}
            </button>
            <button type="button" class="btn btn-outline-secondary" (click)="cancelForm()" [disabled]="saving">
              Atcelt
            </button>
          </div>

        </section>

      </div>
    </div>
  `,
  styles: [`
    .tm-page { min-height: 100vh; background: #faf5f3; }

    .panel-header {
      background: linear-gradient(135deg, #7a5548 0%, #5C4033 100%);
      color: #fff;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .panel-title { font-weight: 700; font-size: 1rem; }

    .admin-section {
      background: #fff;
      border-radius: 12px;
      padding: 28px 32px;
      box-shadow: 0 2px 12px rgba(92,64,51,0.07);
      margin-bottom: 24px;
    }

    .section-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .section-heading {
      font-size: 1.1rem;
      font-weight: 700;
      color: #5C4033;
      margin: 0;
    }

    /* Trips list */
    .trips-list { display: flex; flex-direction: column; gap: 10px; }

    .trip-list-item {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 14px;
      border: 1.5px solid #f0e7e2;
      border-radius: 8px;
      background: #fdf8f6;
    }

    .trip-list-name { display: block; font-size: 0.95rem; margin-bottom: 6px; color: #1a202c; }

    .trip-list-meta { display: flex; flex-wrap: wrap; gap: 6px; }

    .trip-list-actions { display: flex; gap: 6px; flex-shrink: 0; }

    /* Form sections */
    .form-section { margin-bottom: 28px; }

    .section-label {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #5C4033;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f0e7e2;
    }

    .field-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 5px;
      display: block;
    }

    .req { color: #e84040; }
    .optional { font-weight: 400; color: #9ca3af; font-size: 0.78rem; }

    .field-input {
      border: 1.5px solid #cbb5ae;
      border-radius: 8px;
      font-size: 0.9rem;
      transition: border-color 0.18s, box-shadow 0.18s;
    }

    .field-input:focus {
      border-color: #5C4033;
      box-shadow: 0 0 0 3px rgba(92,64,51,0.12);
    }

    /* Cover photo */
    .photo-upload-area { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }

    .cover-preview {
      width: 320px;
      height: 180px;
      border-radius: 10px;
      overflow: hidden;
      border: 2px solid #cbb5ae;
    }

    .cover-preview img { width: 100%; height: 100%; object-fit: cover; }

    .cover-placeholder {
      width: 320px;
      height: 180px;
      border-radius: 10px;
      border: 2px dashed #cbb5ae;
      background: #faf5f3;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      font-size: 0.88rem;
    }

    /* Day cards */
    .day-card {
      border: 1.5px solid #f0e7e2;
      border-radius: 10px;
      padding: 16px 18px;
      margin-bottom: 14px;
      background: #fdf8f6;
    }

    .day-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .day-badge {
      background: #5C4033;
      color: #fff;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 3px 12px;
      border-radius: 20px;
    }

    .btn-remove-day { font-size: 0.78rem; }

    .day-photo-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

    .day-photo-thumb {
      width: 80px;
      height: 60px;
      border-radius: 6px;
      overflow: hidden;
      border: 1.5px solid #cbb5ae;
    }

    .day-photo-thumb img { width: 100%; height: 100%; object-fit: cover; }

    /* Additional photos grid */
    .additional-photos-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: flex-start;
    }

    .add-photo-thumb {
      position: relative;
      width: 100px;
      height: 75px;
      border-radius: 8px;
      overflow: hidden;
      border: 1.5px solid #cbb5ae;
    }

    .add-photo-thumb img { width: 100%; height: 100%; object-fit: cover; }

    .remove-photo-btn {
      position: absolute;
      top: 3px;
      right: 3px;
      width: 20px;
      height: 20px;
      background: rgba(0,0,0,0.55);
      color: #fff;
      border: none;
      border-radius: 50%;
      font-size: 0.65rem;
      line-height: 20px;
      text-align: center;
      cursor: pointer;
      padding: 0;
    }

    .add-photo-add-btn {
      width: 100px;
      height: 75px;
      border-radius: 8px;
      border: 2px dashed #cbb5ae;
      background: #faf5f3;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #7a5548;
      font-size: 0.78rem;
      text-align: center;
      transition: border-color 0.18s;
    }

    .add-photo-add-btn:hover { border-color: #5C4033; }

    .flight-entry-row {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }

    /* Upload labels */
    .upload-label { cursor: pointer; }

    /* Form actions */
    .form-actions {
      display: flex;
      gap: 12px;
      padding-top: 20px;
      border-top: 2px solid #f0e7e2;
      margin-top: 8px;
    }

    .btn-save {
      padding: 10px 32px;
      font-weight: 600;
      font-size: 0.95rem;
    }

    /* ---- ADMIN FILTERS ---- */
    .admin-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: flex-end;
      padding: 14px 0 18px;
      border-bottom: 1px solid #eee;
      margin-bottom: 16px;
    }

    .af-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 160px;
    }

    .af-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #999;
      margin: 0;
    }

    @media (max-width: 600px) {
      .admin-section { padding: 18px 14px; }
      .cover-preview, .cover-placeholder { width: 100%; }
      .admin-filters { flex-direction: column; }
      .af-field { min-width: 100%; }
    }

    .btn-primary {
      background-color: #5C4033 !important;
      border-color: #5C4033 !important;
      color: #fff !important;
    }
    .btn-primary:hover:not(:disabled), .btn-primary:focus {
      background-color: #3d2a22 !important;
      border-color: #3d2a22 !important;
    }
    .btn-outline-primary {
      color: #5C4033 !important;
      border-color: #5C4033 !important;
      background: transparent !important;
    }
    .btn-outline-primary:hover {
      background-color: #5C4033 !important;
      color: #fff !important;
    }
  `]
})
export class TripManagementComponent implements OnInit {
  readonly imageBase = '/api/images/';

  trips: Trip[] = [];
  loadingTrips = false;

  filterName = '';
  filterStartDate = '';
  filterEndDate = '';
  filterDuration: number | null = null;

  get hasAdminFilters(): boolean {
    return !!(this.filterName || this.filterStartDate || this.filterEndDate || this.filterDuration);
  }

  get filteredTrips(): Trip[] {
    return this.trips.filter(t => {
      if (this.filterName && !t.name.toLowerCase().includes(this.filterName.toLowerCase())) return false;
      if (this.filterStartDate && t.startDate < this.filterStartDate) return false;
      if (this.filterEndDate && t.endDate > this.filterEndDate) return false;
      if (this.filterDuration) {
        const dur = Math.round((new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86400000) + 1;
        if (dur !== this.filterDuration) return false;
      }
      return true;
    });
  }

  clearAdminFilters(): void {
    this.filterName = '';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.filterDuration = null;
  }
  showForm = false;
  editingTripId: string | null = null;

  form: TripForm = this.emptyForm();
  days: FormDay[] = [this.emptyDay(1)];
  flightSchedules: string[] = [''];
  priceIncludedItems: string[] = [''];
  extraChargeItems: string[] = [''];
  editingTripHidden = false;
  coverPhotoFile: File | null = null;
  coverPhotoPreview: string | null = null;
  additionalPhotoFiles: File[] = [];
  additionalPhotoPreviews: string[] = [];
  existingAdditionalImages: { id: number; path: string }[] = [];

  saving = false;
  saveError = '';
  saveSuccess = '';
  saveProgress = 0;

  constructor(
    private tripService: TripService,
    private adminState: AdminStateService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTrips();
  }

  get durationDays(): number {
    if (!this.form.startDate || !this.form.endDate) return 0;
    const diff = new Date(this.form.endDate).getTime() - new Date(this.form.startDate).getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  loadTrips() {
    this.loadingTrips = true;
    this.tripService.getAllTrips().subscribe({
      next: (trips) => { this.trips = trips; this.loadingTrips = false; },
      error: () => { this.loadingTrips = false; }
    });
  }

  emptyForm(): TripForm {
    return {
      name: '', startDate: '', endDate: '',
      priceEur: 0, availableSpots: 0,
      transportationType: '', accommodation: '',
      airlineCompany: '', includedBaggageSize: '', groupSize: 0,
      priceIncluded: '', extraCharge: '',
      description: '', paymentInfo: '', landingSection: ''
    };
  }

  emptyDay(n: number): FormDay {
    return { dayNumber: n, date: '', description: '', imageFile: null, imagePreview: null, existingImagePath: null };
  }

  openCreateForm() {
    this.editingTripId = null;
    this.form = this.emptyForm();
    const firstDay = this.emptyDay(1);
    firstDay.date = this.form.startDate; // empty at create time; will auto-set when user picks start date
    this.days = [firstDay];
    this.flightSchedules = [''];
    this.priceIncludedItems = [''];
    this.extraChargeItems = [''];
    this.editingTripHidden = false;
    this.coverPhotoFile = null;
    this.coverPhotoPreview = null;
    this.additionalPhotoFiles = [];
    this.additionalPhotoPreviews = [];
    this.existingAdditionalImages = [];
    this.saveError = '';
    this.saveSuccess = '';
    this.showForm = true;
  }

  openEditForm(trip: Trip) {
    this.editingTripId = String(trip.id);
    this.form = {
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      priceEur: trip.priceCents / 100,
      availableSpots: trip.availableSpots,
      transportationType: trip.transportationType || '',
      accommodation: trip.accommodation || '',
      airlineCompany: trip.airlineCompany || '',
      includedBaggageSize: trip.includedBaggageSize || '',
      groupSize: trip.groupSize || 0,
      priceIncluded: trip.priceIncluded || '',
      extraCharge: trip.extraCharge || '',
      description: trip.description || '',
      paymentInfo: trip.paymentInfo || '',
      landingSection: trip.landingSection || ''
    };
    this.days = [];
    if (trip.itineraryJson) {
      try {
        const parsed: { dayNumber: number; date: string; description: string; imagePath: string | null }[] =
          JSON.parse(trip.itineraryJson);
        this.days = parsed.map(d => ({
          dayNumber: d.dayNumber,
          date: d.date,
          description: d.description,
          imageFile: null,
          imagePreview: null,
          existingImagePath: d.imagePath ?? null
        }));
      } catch { /* ignore parse errors */ }
    }
    if (this.days.length === 0) this.days = [this.emptyDay(1)];
    this.flightSchedules = [''];
    if (trip.flightScheduleJson) {
      try {
        const parsed: string[] = JSON.parse(trip.flightScheduleJson);
        if (parsed.length > 0) this.flightSchedules = parsed;
      } catch { /* ignore parse errors */ }
    }
    this.priceIncludedItems = trip.priceIncluded
      ? trip.priceIncluded.split('\n').map(s => s.replace(/^[•\-\*]\s*/, '').trim()).filter(s => s)
      : [''];
    if (this.priceIncludedItems.length === 0) this.priceIncludedItems = [''];
    this.extraChargeItems = trip.extraCharge
      ? trip.extraCharge.split('\n').map(s => s.replace(/^[•\-\*]\s*/, '').trim()).filter(s => s)
      : [''];
    if (this.extraChargeItems.length === 0) this.extraChargeItems = [''];
    this.editingTripHidden = trip.hidden ?? false;
    this.coverPhotoFile = null;
    this.coverPhotoPreview = null;
    this.additionalPhotoFiles = [];
    this.additionalPhotoPreviews = [];
    this.existingAdditionalImages = [];
    this.saveError = '';
    this.saveSuccess = '';
    this.showForm = true;

    // Load existing images (cover + additional)
    this.tripService.getTripImages(String(trip.id)).subscribe({
      next: (images) => {
        const cover = images.find(img => img.isCover);
        if (cover) this.coverPhotoPreview = '/images/' + cover.path;
        this.existingAdditionalImages = images
          .filter(img => !img.isCover)
          .map(img => ({ id: img.id, path: img.path }));
      },
      error: () => { /* ignore */ }
    });
  }

  cancelForm() {
    this.showForm = false;
    this.editingTripId = null;
  }

  onCoverPhotoChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.coverPhotoFile = file;
    const reader = new FileReader();
    reader.onload = e => { this.coverPhotoPreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  onDayImageChange(event: Event, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.days[index].imageFile = file;
    const reader = new FileReader();
    reader.onload = e => { this.days[index].imagePreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  removeDayImage(index: number) {
    this.days[index].imageFile = null;
    this.days[index].imagePreview = null;
    this.days[index].existingImagePath = null;
  }

  onAdditionalPhotosChange(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;
    Array.from(files).forEach(file => {
      this.additionalPhotoFiles.push(file);
      const reader = new FileReader();
      reader.onload = e => { this.additionalPhotoPreviews.push(e.target?.result as string); };
      reader.readAsDataURL(file);
    });
    (event.target as HTMLInputElement).value = '';
  }

  removeAdditionalPhoto(index: number) {
    this.additionalPhotoFiles.splice(index, 1);
    this.additionalPhotoPreviews.splice(index, 1);
  }

  removeExistingAdditionalImage(index: number) {
    if (!this.editingTripId) return;
    const img = this.existingAdditionalImages[index];
    this.tripService.deleteImage(this.editingTripId, img.id).subscribe({
      next: () => { this.existingAdditionalImages.splice(index, 1); },
      error: () => alert('Neizdevās dzēst attēlu.')
    });
  }

  addFlightEntry() {
    this.flightSchedules.push('');
  }

  removeFlightEntry(index: number) {
    this.flightSchedules.splice(index, 1);
  }

  addPriceIncluded() { this.priceIncludedItems.push(''); }
  removePriceIncluded(index: number) { this.priceIncludedItems.splice(index, 1); }
  addExtraCharge() { this.extraChargeItems.push(''); }
  removeExtraCharge(index: number) { this.extraChargeItems.splice(index, 1); }

  copyTrip(trip: Trip) {
    this.editingTripId = null;
    this.editingTripHidden = false;
    this.form = {
      name: 'Kopija - ' + trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      priceEur: trip.priceCents / 100,
      availableSpots: trip.availableSpots,
      transportationType: trip.transportationType || '',
      accommodation: trip.accommodation || '',
      airlineCompany: trip.airlineCompany || '',
      includedBaggageSize: trip.includedBaggageSize || '',
      groupSize: trip.groupSize || 0,
      priceIncluded: trip.priceIncluded || '',
      extraCharge: trip.extraCharge || '',
      description: trip.description || '',
      paymentInfo: trip.paymentInfo || '',
      landingSection: trip.landingSection || ''
    };
    this.days = [];
    if (trip.itineraryJson) {
      try {
        const parsed: { dayNumber: number; date: string; description: string; imagePath: string | null }[] =
          JSON.parse(trip.itineraryJson);
        this.days = parsed.map(d => ({
          dayNumber: d.dayNumber, date: d.date, description: d.description,
          imageFile: null, imagePreview: null, existingImagePath: d.imagePath ?? null
        }));
      } catch { /* ignore */ }
    }
    if (this.days.length === 0) this.days = [this.emptyDay(1)];
    this.flightSchedules = [''];
    if (trip.flightScheduleJson) {
      try {
        const parsed: string[] = JSON.parse(trip.flightScheduleJson);
        if (parsed.length > 0) this.flightSchedules = parsed;
      } catch { /* ignore */ }
    }
    this.priceIncludedItems = trip.priceIncluded
      ? trip.priceIncluded.split('\n').map(s => s.replace(/^[•\-\*]\s*/, '').trim()).filter(s => s)
      : [''];
    if (this.priceIncludedItems.length === 0) this.priceIncludedItems = [''];
    this.extraChargeItems = trip.extraCharge
      ? trip.extraCharge.split('\n').map(s => s.replace(/^[•\-\*]\s*/, '').trim()).filter(s => s)
      : [''];
    if (this.extraChargeItems.length === 0) this.extraChargeItems = [''];
    this.coverPhotoFile = null;
    this.coverPhotoPreview = null;
    this.additionalPhotoFiles = [];
    this.additionalPhotoPreviews = [];
    this.existingAdditionalImages = [];
    this.saveError = '';
    this.saveSuccess = '';
    this.showForm = true;
  }

  toggleHidden(trip: Trip) {
    const newHidden = !trip.hidden;
    this.tripService.setTripHidden(String(trip.id), newHidden).subscribe({
      next: () => this.loadTrips(),
      error: () => alert('Neizdevās mainīt redzamību.')
    });
  }

  addDay() {
    const nextDate = this.dateForDayIndex(this.days.length);
    const day = this.emptyDay(this.days.length + 1);
    day.date = nextDate;
    this.days.push(day);
  }

  dateForDayIndex(index: number): string {
    if (!this.form.startDate) return '';
    const d = new Date(this.form.startDate);
    d.setDate(d.getDate() + index);
    return d.toISOString().split('T')[0];
  }

  onStartDateChange(newDate: string) {
    this.form.startDate = newDate;
    // Re-fill all day dates sequentially from the new start date
    this.days.forEach((day, i) => {
      day.date = this.dateForDayIndex(i);
    });
  }

  removeDay(index: number) {
    if (this.days.length <= 1) return;
    this.days.splice(index, 1);
    this.days.forEach((d, i) => { d.dayNumber = i + 1; });
  }

  // TypeScript helper to use String() in template
  String(val: unknown): string { return String(val); }

  trackByIndex(index: number): number { return index; }

  async saveTrip() {
    if (!this.form.name || !this.form.startDate || !this.form.endDate) {
      this.saveError = 'Lūdzu aizpildiet nosaukumu un datumus.';
      return;
    }

    this.saving = true;
    this.saveError = '';
    this.saveSuccess = '';
    this.saveProgress = 5;

    try {
      const payload: Partial<Trip> = {
        name: this.form.name,
        startDate: this.form.startDate,
        endDate: this.form.endDate,
        priceCents: Math.round((this.form.priceEur || 0) * 100),
        currency: 'EUR',
        availableSpots: this.form.availableSpots || 0,
        description: this.form.description || undefined,
        landingSection: this.form.landingSection || undefined,
        transportationType: this.form.transportationType || undefined,
        accommodation: this.form.accommodation || undefined,
        airlineCompany: this.form.airlineCompany || undefined,
        includedBaggageSize: this.form.includedBaggageSize || undefined,
        groupSize: this.form.groupSize || undefined,
        priceIncluded: this.priceIncludedItems.filter(s => s.trim()).join('\n') || undefined,
        extraCharge: this.extraChargeItems.filter(s => s.trim()).join('\n') || undefined,
        hidden: this.editingTripHidden,
        paymentInfo: this.form.paymentInfo || undefined,
      };

      let tripId: string;

      if (this.editingTripId) {
        await firstValueFrom(this.tripService.updateTrip(this.editingTripId, payload));
        tripId = this.editingTripId;
      } else {
        const created = await firstValueFrom(this.tripService.createTrip(payload as Trip));
        tripId = String(created.id);
      }

      this.saveProgress = 25;

      // Upload cover photo
      if (this.coverPhotoFile) {
        const uploaded = await firstValueFrom(this.tripService.uploadImage(tripId, this.coverPhotoFile));
        await firstValueFrom(this.tripService.setCoverImage(tripId, uploaded.id));
      }

      this.saveProgress = 45;

      // Build itinerary, uploading day images
      const itinerary: { dayNumber: number; date: string; description: string; imagePath: string | null }[] = [];
      for (const day of this.days) {
        let imagePath: string | null = day.existingImagePath;
        if (day.imageFile) {
          const uploaded = await firstValueFrom(this.tripService.uploadImage(tripId, day.imageFile));
          imagePath = uploaded.path;
        }
        itinerary.push({ dayNumber: day.dayNumber, date: day.date, description: day.description, imagePath });
      }

      this.saveProgress = 70;

      // Save itinerary and flight schedule JSON back to trip
      const flightScheduleJson = JSON.stringify(this.flightSchedules.filter(s => s.trim()));
      await firstValueFrom(this.tripService.updateTrip(tripId, { ...payload, itineraryJson: JSON.stringify(itinerary), flightScheduleJson }));

      this.saveProgress = 85;

      // Upload additional photos
      for (const file of this.additionalPhotoFiles) {
        await firstValueFrom(this.tripService.uploadImage(tripId, file));
      }

      this.saveProgress = 100;
      this.saveSuccess = this.editingTripId ? 'Ceļojums atjaunināts!' : 'Ceļojums izveidots!';
      this.showForm = false;
      this.loadTrips();

    } catch {
      this.saveError = 'Kļūda saglabājot. Pārbaudiet savienojumu ar serveri.';
    } finally {
      this.saving = false;
    }
  }

  deleteTrip(id: string) {
    if (!confirm('Vai tiešām vēlaties dzēst šo ceļojumu?')) return;
    this.tripService.deleteTrip(id).subscribe({
      next: () => this.loadTrips(),
      error: () => alert('Neizdevās dzēst ceļojumu.')
    });
  }

  logout() {
    this.adminState.logout();
    this.router.navigate(['/admin/login']);
  }
}

