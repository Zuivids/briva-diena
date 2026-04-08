import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminStateService } from '../../shared/services/admin-state.service';
import { TripService } from '../../shared/services/trip.service';
import { ReviewService } from '../../shared/services/review.service';
import { InstagramService, InstagramPost } from '../../shared/services/instagram.service';
import { Trip } from '../../shared/models/trip.model';
import { Review } from '../../shared/models/review.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
            <ng-container *ngFor="let trip of trips">
              <div class="list-item">
                <div class="list-item-info">
                  <strong>{{ trip.name }}</strong>
                  <span class="badge bg-secondary ms-2">{{ trip.startDate | date:'dd.MM.yyyy' }} &ndash; {{ trip.endDate | date:'dd.MM.yyyy' }}</span>
                  <span class="badge bg-primary ms-2">&#8364;{{ (trip.priceCents / 100) | number:'1.0-0' }}</span>
                  <span class="badge bg-light text-dark ms-2">{{ trip.availableSpots }} vietas</span>
                  <span *ngIf="trip.landingSection === 'TOP'" class="badge bg-success ms-2">TOP</span>
                  <span *ngIf="trip.landingSection === 'LAST_CHANCE'" class="badge bg-warning text-dark ms-2">Pēdējā iespēja</span>
                </div>
                <div class="d-flex gap-2">
                  <a [routerLink]="['/trip', trip.id]" class="btn btn-sm btn-outline-secondary" target="_blank">Apskatīt</a>
                  <button class="btn btn-sm btn-outline-primary" (click)="toggleEdit(trip)">
                    {{ editingTripId === trip.id ? 'Atcelt' : 'Rediģēt' }}
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="removeTrip(trip.id)">Dzēst</button>
                </div>
              </div>

              <div *ngIf="editingTripId === trip.id" class="edit-panel">
                <p class="edit-panel-title">Rediģēt ceļojumu</p>
                <div class="row g-2 mb-2">
                  <div class="col-12">
                    <input type="text" [(ngModel)]="editForm.name" class="form-control form-control-sm" placeholder="Nosaukums" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label form-label-sm">Sākuma datums</label>
                    <input type="date" [(ngModel)]="editForm.startDate" class="form-control form-control-sm" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label form-label-sm">Beigu datums</label>
                    <input type="date" [(ngModel)]="editForm.endDate" class="form-control form-control-sm" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label form-label-sm">Cena (&euro;)</label>
                    <input type="number" [(ngModel)]="editForm.priceEur" class="form-control form-control-sm" min="0" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label form-label-sm">Brīvās vietas</label>
                    <input type="number" [(ngModel)]="editForm.availableSpots" class="form-control form-control-sm" min="0" />
                  </div>
                  <div class="col-12">
                    <textarea [(ngModel)]="editForm.description" class="form-control form-control-sm" rows="2" placeholder="Apraksts"></textarea>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-sm">Rādīt sākumlapā</label>
                    <select [(ngModel)]="editForm.landingSection" class="form-select form-select-sm">
                      <option value="">Nav</option>
                      <option value="TOP">TOP ceļojumi</option>
                      <option value="LAST_CHANCE">Pēdējā iespēja</option>
                    </select>
                  </div>
                  <div class="col-12 d-flex align-items-center gap-2">
                    <button class="btn btn-primary btn-sm" (click)="saveEdit()">Saglabāt</button>
                    <button class="btn btn-secondary btn-sm" (click)="cancelEdit()">Atcelt</button>
                    <span *ngIf="editError" class="text-danger small">{{ editError }}</span>
                  </div>
                </div>

                <hr class="my-3" />
                <p class="edit-panel-title">Vāka attēls</p>
                <div class="cover-section mb-3">
                  <ng-container *ngIf="coverImage; else noCover">
                    <div class="cover-preview-wrap">
                      <img [src]="imageBaseUrl + coverImage.path" class="cover-preview" alt="Cover" />
                      <button class="image-delete-btn" (click)="deleteCover()" title="Noņemt vāka attēlu">&#x2715;</button>
                    </div>
                    <p class="hint mt-1">Noklikšķiniet uz cita attēla galerijā, lai to iestatītu kā vāku.</p>
                  </ng-container>
                  <ng-template #noCover>
                    <p class="hint">Nav vāka attēla. Augšupielādējiet attēlu un noklikšķiniet "Iestatīt kā vāku".</p>
                  </ng-template>
                </div>

                <p class="edit-panel-title">Galerija</p>
                <div class="images-grid">
                  <div *ngFor="let img of tripImages" class="image-thumb-wrap">
                    <img [src]="imageBaseUrl + img.path" class="image-thumb" [class.cover-active]="img.isCover" [alt]="img.path" />
                    <div class="image-thumb-actions">
                      <button class="img-action-btn cover-btn" (click)="setCover(img.id)" [title]="img.isCover ? 'Vāka attēls' : 'Iestatīt kā vāku'">
                        {{ img.isCover ? '★' : '☆' }}
                      </button>
                      <button class="img-action-btn delete-btn" (click)="deleteImage(img.id)" title="Dzēst">&#x2715;</button>
                    </div>
                  </div>
                  <label class="image-upload-btn" [for]="'imageUpload' + trip.id">
                    + Pievienot
                    <input [id]="'imageUpload' + trip.id" type="file" accept="image/*" class="visually-hidden" (change)="uploadImage($event)" />
                  </label>
                </div>
              </div>
            </ng-container>
            <p *ngIf="trips.length === 0" class="text-muted small mb-0 p-3">Nav pievienotu ceļojumu.</p>
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

        <!-- ── About Page ── -->
        <section class="admin-section">
          <h4 class="section-heading">Par mums lapa</h4>

          <p class="hint mb-2">Attēls tiks rādīts kreisajā pusē blakus tekstam.</p>
          <div class="hero-row mb-3">
            <ng-container *ngIf="aboutPageImagePreview; else noAboutImg">
              <img [src]="aboutPageImagePreview" alt="Par mums" class="hero-thumb" />
              <div class="ms-3 d-flex flex-column gap-2">
                <label class="btn btn-outline-primary btn-sm upload-btn" for="aboutPageImageFile">
                  Mainīt attēlu
                  <input id="aboutPageImageFile" type="file" accept="image/*" class="visually-hidden" (change)="onAboutPageImageUpload($event)" />
                </label>
                <button class="btn btn-outline-danger btn-sm" (click)="removeAboutPageImage()">Noņemt attēlu</button>
              </div>
            </ng-container>
            <ng-template #noAboutImg>
              <label class="btn btn-outline-primary btn-sm upload-btn" for="aboutPageImageFile">
                Pievienot attēlu
                <input id="aboutPageImageFile" type="file" accept="image/*" class="visually-hidden" (change)="onAboutPageImageUpload($event)" />
              </label>
            </ng-template>
          </div>

          <p class="hint mb-2">Katrs rindkopas atdalīts ar tukšu rindu.</p>
          <textarea [(ngModel)]="aboutPageContent" name="aboutPageContent"
            class="form-control" rows="8"></textarea>
          <div class="mt-2 d-flex align-items-center gap-2">
            <button class="btn btn-primary btn-sm" (click)="saveAboutPage()">Saglabāt</button>
            <span *ngIf="aboutPageSaved" class="text-success small">Saglabāts!</span>
          </div>
        </section>

        <hr class="section-divider" />

        <!-- ── FAQ Page ── -->
        <section class="admin-section">
          <h4 class="section-heading">BUJ lapa</h4>

          <div class="items-list mb-3">
            <div *ngFor="let item of faqItems" class="list-item faq-list-item">
              <div class="list-item-info faq-item-info">
                <strong>{{ item.question }}</strong>
                <span class="text-muted small d-block">{{ item.answer.length > 100 ? (item.answer | slice:0:100) + '...' : item.answer }}</span>
              </div>
              <div class="d-flex gap-2 flex-shrink-0">
                <button class="btn btn-sm btn-outline-primary" (click)="toggleFaqEdit(item)">
                  {{ editingFaqId === item.id ? 'Atcelt' : 'Rediģēt' }}
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="removeFaqItem(item.id)">Dzēst</button>
              </div>

              <div *ngIf="editingFaqId === item.id" class="edit-panel w-100">
                <p class="edit-panel-title">Rediģēt jautājumu</p>
                <div class="row g-2">
                  <div class="col-12">
                    <input type="text" [(ngModel)]="faqEditForm.question" name="faqEditQ"
                      class="form-control form-control-sm" placeholder="Jautājums" />
                  </div>
                  <div class="col-12">
                    <textarea [(ngModel)]="faqEditForm.answer" name="faqEditA"
                      class="form-control form-control-sm" rows="3" placeholder="Atbilde"></textarea>
                  </div>
                  <div class="col-12 d-flex align-items-center gap-2">
                    <button class="btn btn-primary btn-sm" (click)="saveFaqEdit()">Saglabāt</button>
                    <button class="btn btn-secondary btn-sm" (click)="editingFaqId = null">Atcelt</button>
                    <span *ngIf="faqEditError" class="text-danger small">{{ faqEditError }}</span>
                  </div>
                </div>
              </div>
            </div>
            <p *ngIf="faqItems.length === 0" class="text-muted small mb-0 p-3">Nav pievienotu jautājumu.</p>
          </div>

          <div class="add-form">
            <p class="add-form-label">Pievienot jautājumu</p>
            <div class="row g-2">
              <div class="col-12">
                <input type="text" [(ngModel)]="newFaqQuestion" name="faqQ"
                  class="form-control form-control-sm" placeholder="Jautājums" />
              </div>
              <div class="col-12">
                <textarea [(ngModel)]="newFaqAnswer" name="faqA"
                  class="form-control form-control-sm" rows="3"
                  placeholder="Atbilde"></textarea>
              </div>
              <div class="col-12 d-flex align-items-center gap-2">
                <button class="btn btn-primary btn-sm" (click)="addFaqItem()">Pievienot</button>
                <span *ngIf="faqError" class="text-danger small">{{ faqError }}</span>
              </div>
            </div>
          </div>
        </section>

        <hr class="section-divider" />

        <!-- ── Instagram ── -->
        <section class="admin-section">
          <h4 class="section-heading">Instagram ieraksti <span class="section-url">/</span></h4>
          <p class="hint mb-3">Max 5 ieraksti.</p>

          <div class="items-list mb-3">
            <div *ngFor="let post of instagramPosts" class="list-item">
              <div class="list-item-info">
                <a [href]="post.url" target="_blank" rel="noopener noreferrer" class="text-primary small">{{ post.url }}</a>
              </div>
              <button class="btn btn-sm btn-outline-danger flex-shrink-0" (click)="removeInstagramPost(post.id)">Dzēst</button>
            </div>
            <p *ngIf="instagramPosts.length === 0" class="text-muted small mb-0 p-3">Nav pievienotu ierakstu.</p>
          </div>

          <div *ngIf="instagramPosts.length < 5" class="add-form">
            <div class="row g-2">
              <div class="col">
                <input type="url" [(ngModel)]="newInstagramUrl" name="igUrl"
                  class="form-control form-control-sm"
                  placeholder="https://www.instagram.com/p/XXXXX/" />
              </div>
              <div class="col-auto">
                <button class="btn btn-primary btn-sm" (click)="addInstagramPost()">Pievienot</button>
              </div>
            </div>
            <span *ngIf="instagramError" class="text-danger small d-block mt-1">{{ instagramError }}</span>
          </div>
          <p *ngIf="instagramPosts.length >= 5" class="hint mt-2">Sasniegts maksimālais skaits (5).</p>
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

    .edit-panel {
      background: #f0f4ff;
      border-top: 1px solid #d4daf5;
      padding: 16px;
    }

    .edit-panel-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: #1746a0;
      margin-bottom: 10px;
    }

    .form-label-sm {
      font-size: 0.75rem;
      color: #666;
      margin-bottom: 2px;
    }

    .images-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: flex-start;
    }

    .image-thumb-wrap {
      position: relative;
    }

    .image-thumb {
      width: 90px;
      height: 68px;
      object-fit: cover;
      border-radius: 6px;
      border: 2px solid #d0d5dd;
      display: block;
    }

    .image-thumb.cover-active {
      border-color: #e87722;
      box-shadow: 0 0 0 2px #e87722;
    }

    .image-thumb-actions {
      position: absolute;
      top: -8px;
      right: -8px;
      display: flex;
      gap: 3px;
    }

    .img-action-btn {
      width: 20px;
      height: 20px;
      border: none;
      border-radius: 50%;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    .cover-btn {
      background: #e87722;
      color: #fff;
    }

    .delete-btn {
      background: #dc3545;
      color: #fff;
    }

    .image-delete-btn {
      position: absolute;
      top: -6px;
      right: -6px;
      background: #dc3545;
      color: #fff;
      border: none;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      padding: 0;
    }

    .cover-section {
      display: flex;
      align-items: flex-start;
      flex-direction: column;
    }

    .cover-preview-wrap {
      position: relative;
      display: inline-block;
    }

    .cover-preview {
      width: 180px;
      height: 110px;
      object-fit: cover;
      border-radius: 8px;
      border: 2px solid #e87722;
      display: block;
    }

    .image-upload-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 90px;
      height: 68px;
      border: 2px dashed #99acdf;
      border-radius: 6px;
      font-size: 0.75rem;
      color: #1746a0;
      cursor: pointer;
      text-align: center;
    }

    .image-upload-btn:hover {
      background: #e8eeff;
    }

    .section-url {
      font-size: 0.8rem;
      font-weight: 400;
      color: #888;
      margin-left: 6px;
    }

    .faq-list-item {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 8px;
    }

    .faq-item-info {
      width: 100%;
    }

    .faq-list-item .btn-outline-danger {
      align-self: flex-end;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  trips: Trip[] = [];
  reviews: Review[] = [];
  aboutText = '';
  aboutSaved = false;
  aboutPageContent = '';
  aboutPageSaved = false;
  aboutPageImagePreview: string | null = null;
  faqItems: { id: string; question: string; answer: string }[] = [];
  newFaqQuestion = '';
  newFaqAnswer = '';
  faqError = '';
  editingFaqId: string | null = null;
  faqEditForm = { question: '', answer: '' };
  faqEditError = '';
  instagramPosts: InstagramPost[] = [];
  newInstagramUrl = '';
  instagramError = '';
  heroPreview = 'italy_mountain.png';

  // Trip form
  newTripName = '';
  newTripStartDate = '';
  newTripEndDate = '';
  newTripPriceEur = 0;
  newTripSpots = 0;
  newTripDesc = '';
  tripError = '';

  // Trip edit
  editingTripId: string | null = null;
  editForm = { name: '', description: '', startDate: '', endDate: '', priceEur: 0, availableSpots: 0, landingSection: '' };
  editError = '';
  tripImages: { id: number; path: string; isCover: boolean }[] = [];
  coverImage: { id: number; path: string } | null = null;
  readonly imageBaseUrl = 'http://localhost:8080/images/';

  // Review form
  newReviewName = '';
  newReviewText = '';
  newReviewRating = 5;
  reviewError = '';

  constructor(
    public adminState: AdminStateService,
    private tripService: TripService,
    private reviewService: ReviewService,
    private instagramService: InstagramService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.heroPreview = this.adminState.heroImageSrc$.value;
    this.aboutText = this.adminState.aboutText$.value;
    this.aboutPageContent = this.adminState.aboutPageContent$.value;
    this.aboutPageImagePreview = this.adminState.aboutPageImage$.value;
    this.faqItems = this.adminState.faqItems$.value;
    this.loadInstagramPosts();
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

  toggleEdit(trip: Trip): void {
    if (this.editingTripId === trip.id) {
      this.cancelEdit();
      return;
    }
    this.editingTripId = trip.id;
    this.editError = '';
    this.editForm = {
      name: trip.name,
      description: trip.description || '',
      startDate: trip.startDate,
      endDate: trip.endDate,
      priceEur: trip.priceCents / 100,
      availableSpots: trip.availableSpots,
      landingSection: trip.landingSection || ''
    };
    this.tripService.getTripImages(trip.id).subscribe({
      next: (imgs) => {
        this.tripImages = imgs;
        this.coverImage = imgs.find(i => i.isCover) ?? null;
      },
      error: () => (this.tripImages = [])
    });
  }

  cancelEdit(): void {
    this.editingTripId = null;
    this.tripImages = [];
    this.coverImage = null;
    this.editError = '';
  }

  saveEdit(): void {
    this.editError = '';
    if (!this.editForm.name.trim() || !this.editForm.startDate || !this.editForm.endDate) {
      this.editError = 'Nosaukums un datumi ir obligāti.';
      return;
    }
    const body: Partial<Trip> = {
      name: this.editForm.name,
      description: this.editForm.description,
      startDate: this.editForm.startDate,
      endDate: this.editForm.endDate,
      priceCents: Math.round(this.editForm.priceEur * 100),
      currency: 'EUR',
      availableSpots: this.editForm.availableSpots,
      landingSection: this.editForm.landingSection || undefined
    };
    this.tripService.updateTrip(this.editingTripId!, body).subscribe({
      next: () => { this.cancelEdit(); this.loadTrips(); },
      error: () => (this.editError = 'Neizdevās saglabāt ceļojumu.')
    });
  }

  uploadImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.editingTripId) return;
    this.tripService.uploadImage(this.editingTripId, file).subscribe({
      next: (img) => { this.tripImages.push(img); input.value = ''; },
      error: () => {}
    });
  }

  setCover(imageId: number): void {
    if (!this.editingTripId) return;
    this.tripService.setCoverImage(this.editingTripId, imageId).subscribe({
      next: () => {
        this.tripImages.forEach(i => i.isCover = i.id === imageId);
        const found = this.tripImages.find(i => i.id === imageId);
        this.coverImage = found ? { id: found.id, path: found.path } : null;
      },
      error: () => {}
    });
  }

  deleteCover(): void {
    if (!this.coverImage || !this.editingTripId) return;
    const id = this.coverImage.id;
    this.tripService.deleteImage(this.editingTripId, id).subscribe({
      next: () => {
        this.tripImages = this.tripImages.filter(i => i.id !== id);
        this.coverImage = null;
      },
      error: () => {}
    });
  }

  deleteImage(imageId: number): void {
    if (!this.editingTripId) return;
    this.tripService.deleteImage(this.editingTripId, imageId).subscribe({
      next: () => { this.tripImages = this.tripImages.filter(i => i.id !== imageId); },
      error: () => {}
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

  saveAboutPage(): void {
    this.adminState.aboutPageContent$.next(this.aboutPageContent);
    this.aboutPageSaved = true;
    setTimeout(() => (this.aboutPageSaved = false), 2000);
  }

  onAboutPageImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target!.result as string;
      this.aboutPageImagePreview = src;
      this.adminState.aboutPageImage$.next(src);
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeAboutPageImage(): void {
    this.aboutPageImagePreview = null;
    this.adminState.aboutPageImage$.next(null);
  }

  addFaqItem(): void {
    this.faqError = '';
    if (!this.newFaqQuestion.trim() || !this.newFaqAnswer.trim()) {
      this.faqError = 'Jautājums un atbilde ir obligāti.';
      return;
    }
    const updated = [
      ...this.adminState.faqItems$.value,
      { id: Date.now().toString(), question: this.newFaqQuestion.trim(), answer: this.newFaqAnswer.trim() }
    ];
    this.adminState.faqItems$.next(updated);
    this.faqItems = updated;
    this.newFaqQuestion = '';
    this.newFaqAnswer = '';
  }

  removeFaqItem(id: string): void {
    const updated = this.adminState.faqItems$.value.filter(f => f.id !== id);
    this.adminState.faqItems$.next(updated);
    this.faqItems = updated;
    if (this.editingFaqId === id) this.editingFaqId = null;
  }

  toggleFaqEdit(item: { id: string; question: string; answer: string }): void {
    if (this.editingFaqId === item.id) {
      this.editingFaqId = null;
      return;
    }
    this.editingFaqId = item.id;
    this.faqEditForm = { question: item.question, answer: item.answer };
    this.faqEditError = '';
  }

  saveFaqEdit(): void {
    this.faqEditError = '';
    if (!this.faqEditForm.question.trim() || !this.faqEditForm.answer.trim()) {
      this.faqEditError = 'Jautājums un atbilde ir obligāti.';
      return;
    }
    const updated = this.adminState.faqItems$.value.map(f =>
      f.id === this.editingFaqId
        ? { ...f, question: this.faqEditForm.question.trim(), answer: this.faqEditForm.answer.trim() }
        : f
    );
    this.adminState.faqItems$.next(updated);
    this.faqItems = updated;
    this.editingFaqId = null;
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

  addInstagramPost(): void {
    this.instagramError = '';
    const url = this.newInstagramUrl.trim();
    if (!url) { this.instagramError = 'Ievadiet saiti.'; return; }
    if (!url.startsWith('https://www.instagram.com/p/') && !url.startsWith('https://www.instagram.com/reel/')) {
      this.instagramError = 'Saitei jāsākas ar https://www.instagram.com/p/ vai /reel/';
      return;
    }
    this.instagramService.add(url).subscribe({
      next: (post) => {
        this.instagramPosts = [...this.instagramPosts, post];
        this.adminState.instagramPostUrls$.next(this.instagramPosts.map(p => p.url));
        this.newInstagramUrl = '';
      },
      error: () => { this.instagramError = 'Neizdevās pievienot ierakstu.'; }
    });
  }

  removeInstagramPost(id: number): void {
    this.instagramService.delete(id).subscribe({
      next: () => {
        this.instagramPosts = this.instagramPosts.filter(p => p.id !== id);
        this.adminState.instagramPostUrls$.next(this.instagramPosts.map(p => p.url));
      },
      error: () => {}
    });
  }

  loadInstagramPosts(): void {
    this.instagramService.getAll().subscribe({
      next: (posts) => {
        this.instagramPosts = posts;
        this.adminState.instagramPostUrls$.next(posts.map(p => p.url));
      },
      error: () => {}
    });
  }

  logout(): void {
    this.adminState.logout();
    this.router.navigate(['/admin/login']);
  }
}
