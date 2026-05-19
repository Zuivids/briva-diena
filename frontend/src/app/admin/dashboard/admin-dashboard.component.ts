import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminStateService } from '../../shared/services/admin-state.service';
import { TripService } from '../../shared/services/trip.service';
import { ReviewService } from '../../shared/services/review.service';
import { InstagramService, InstagramPost } from '../../shared/services/instagram.service';
import { AboutImageService } from '../../shared/services/about-image.service';
import { HeroImageService } from '../../shared/services/hero-image.service';
import { SiteContentService } from '../../shared/services/site-content.service';
import { FaqService } from '../../shared/services/faq.service';
import { FaqItem } from '../../shared/models/faq.model';
import { Trip } from '../../shared/models/trip.model';
import { Review } from '../../shared/models/review.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="admin-panel">

      <div class="container py-4">

        <!-- ── Hero / Titulbildes rediģēšana ── -->
        <section class="admin-section">
          <h4 class="section-heading">Titulbildes rediģēšana</h4>

          <!-- Image upload row -->
          <div class="hero-row mb-3">
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

          <!-- Overlay brightness -->
          <div class="mb-3">
            <label class="form-label-sm d-block mb-1">
              Attēla spilgtums: <strong>{{ heroOverlayOpacity > 0 ? '+' : '' }}{{ heroOverlayOpacity }}%</strong>
            </label>
            <p class="hint mb-1">Negatīvs = tumšāks, pozitīvs = gaišāks</p>
            <input type="range" class="form-range" min="-100" max="100" step="1"
              [(ngModel)]="heroOverlayOpacity" name="heroOverlayOpacity" />
          </div>

          <hr class="my-3" />

          <!-- Hero text settings -->
          <p class="add-form-label mb-2">Virsraksta teksts</p>

          <div class="mb-2">
            <label class="form-label-sm d-block mb-1">Teksts</label>
            <input type="text" class="form-control form-control-sm"
              [(ngModel)]="heroTextContent" name="heroTextContent"
              placeholder="Mazas grupas – lieli iespaidi" />
          </div>

          <div class="row g-2 mb-2">
            <div class="col-md-5">
              <label class="form-label-sm d-block mb-1">Fonts</label>
              <select class="form-select form-select-sm" [(ngModel)]="heroTextFont" name="heroTextFont">
                <option value="inherit">Noklusētais</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                <option *ngFor="let opt of googleFontOptions" [value]="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label-sm d-block mb-1">Teksta novietojums</label>
              <select class="form-select form-select-sm" [(ngModel)]="heroTextPosition" name="heroTextPosition">
                <option value="left">Kreisi</option>
                <option value="center">Centrā</option>
                <option value="right">Labajā pusē</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label-sm d-block mb-1">Izmērs (px)</label>
              <input type="number" class="form-control form-control-sm"
                [(ngModel)]="heroTextSize" name="heroTextSize" min="8" max="120" />
            </div>
            <div class="col-md-1 d-flex align-items-end pb-1">
              <div class="form-check">
                <input type="checkbox" class="form-check-input" id="heroTextBold"
                  [(ngModel)]="heroTextBold" name="heroTextBold" />
                <label class="form-check-label" for="heroTextBold">Treknraksts</label>
              </div>
            </div>
          </div>

          <!-- Google Fonts -->
          <div class="mb-3">
            <label class="form-label-sm d-block mb-1">Pievienot Google fontu</label>
            <div class="d-flex gap-2">
              <input type="text" class="form-control form-control-sm"
                [(ngModel)]="newGoogleFont" name="newGoogleFont"
                placeholder="piem., Playfair Display"
                (keydown.enter)="addGoogleFont()" />
              <button class="btn btn-outline-primary btn-sm flex-shrink-0" (click)="addGoogleFont()">Pievienot</button>
            </div>
            <div class="d-flex flex-wrap gap-1 mt-2" *ngIf="googleFontsList.length > 0">
              <span *ngFor="let f of googleFontsList" class="google-font-chip">
                {{ f }}
                <button (click)="removeGoogleFont(f)" class="google-font-chip-remove">&times;</button>
              </span>
            </div>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-primary btn-sm" (click)="saveHeroSettings()">Saglabāt</button>
            <span *ngIf="heroSettingsSaved" class="text-success small">Saglabāts!</span>
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

          <!-- Row 1 -->
          <div class="about-admin-row mb-4">
            <h6 class="about-row-label">1. rinda <span class="text-muted small">(teksts kreisi, attēls labajā)</span></h6>
            <div class="about-admin-pair">
              <div class="about-admin-text">
                <textarea [(ngModel)]="aboutSections[0]" name="aboutSection0" class="form-control" rows="5"></textarea>
              </div>
              <div class="about-admin-img">
                <ng-container *ngIf="aboutPageImages[0]; else noImg0">
                  <div class="about-img-preview-wrap">
                    <img [src]="aboutPageImages[0]" alt="Attēls 1" class="about-img-preview" />
                    <button class="image-delete-btn" (click)="removeAboutPageSideImage(0)" title="Dzēst">&times;</button>
                  </div>
                  <label class="btn btn-outline-primary btn-sm mt-1 upload-btn" for="aboutSideImg0">
                    Mainīt
                    <input id="aboutSideImg0" type="file" accept="image/*" class="visually-hidden" (change)="onAboutPageSideImageUpload($event, 0)" />
                  </label>
                </ng-container>
                <ng-template #noImg0>
                  <label class="image-upload-btn flex-column gap-1" for="aboutSideImg0">
                    <span style="font-size:1.4rem;line-height:1">+</span>
                    <span>Foto 1</span>
                    <input id="aboutSideImg0" type="file" accept="image/*" class="visually-hidden" (change)="onAboutPageSideImageUpload($event, 0)" />
                  </label>
                </ng-template>
              </div>
            </div>
          </div>

          <!-- Row 2 (reversed) -->
          <div class="about-admin-row mb-4">
            <h6 class="about-row-label">2. rinda <span class="text-muted small">(attēls kreisi, teksts labajā)</span></h6>
            <div class="about-admin-pair reversed">
              <div class="about-admin-text">
                <textarea [(ngModel)]="aboutSections[1]" name="aboutSection1" class="form-control" rows="5"></textarea>
              </div>
              <div class="about-admin-img">
                <ng-container *ngIf="aboutPageImages[1]; else noImg1">
                  <div class="about-img-preview-wrap">
                    <img [src]="aboutPageImages[1]" alt="Attēls 2" class="about-img-preview" />
                    <button class="image-delete-btn" (click)="removeAboutPageSideImage(1)" title="Dzēst">&times;</button>
                  </div>
                  <label class="btn btn-outline-primary btn-sm mt-1 upload-btn" for="aboutSideImg1">
                    Mainīt
                    <input id="aboutSideImg1" type="file" accept="image/*" class="visually-hidden" (change)="onAboutPageSideImageUpload($event, 1)" />
                  </label>
                </ng-container>
                <ng-template #noImg1>
                  <label class="image-upload-btn flex-column gap-1" for="aboutSideImg1">
                    <span style="font-size:1.4rem;line-height:1">+</span>
                    <span>Foto 2</span>
                    <input id="aboutSideImg1" type="file" accept="image/*" class="visually-hidden" (change)="onAboutPageSideImageUpload($event, 1)" />
                  </label>
                </ng-template>
              </div>
            </div>
          </div>

          <!-- Row 3 -->
          <div class="about-admin-row mb-4">
            <h6 class="about-row-label">3. rinda <span class="text-muted small">(teksts kreisi, attēls labajā)</span></h6>
            <div class="about-admin-pair">
              <div class="about-admin-text">
                <textarea [(ngModel)]="aboutSections[2]" name="aboutSection2" class="form-control" rows="5"></textarea>
              </div>
              <div class="about-admin-img">
                <ng-container *ngIf="aboutPageImages[2]; else noImg2">
                  <div class="about-img-preview-wrap">
                    <img [src]="aboutPageImages[2]" alt="Attēls 3" class="about-img-preview" />
                    <button class="image-delete-btn" (click)="removeAboutPageSideImage(2)" title="Dzēst">&times;</button>
                  </div>
                  <label class="btn btn-outline-primary btn-sm mt-1 upload-btn" for="aboutSideImg2">
                    Mainīt
                    <input id="aboutSideImg2" type="file" accept="image/*" class="visually-hidden" (change)="onAboutPageSideImageUpload($event, 2)" />
                  </label>
                </ng-container>
                <ng-template #noImg2>
                  <label class="image-upload-btn flex-column gap-1" for="aboutSideImg2">
                    <span style="font-size:1.4rem;line-height:1">+</span>
                    <span>Foto 3</span>
                    <input id="aboutSideImg2" type="file" accept="image/*" class="visually-hidden" (change)="onAboutPageSideImageUpload($event, 2)" />
                  </label>
                </ng-template>
              </div>
            </div>
          </div>

          <div class="mt-1 d-flex align-items-center gap-2">
            <button class="btn btn-primary btn-sm" (click)="saveAboutPage()">Saglabāt</button>
            <span *ngIf="aboutPageSaved" class="text-success small">Saglabāts!</span>
            <span *ngIf="aboutImageError" class="text-danger small">{{ aboutImageError }}</span>
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

      </div>
    </div>
  `,
  styles: [`
    .admin-panel {
      min-height: 100vh;
      background: #faf5f3;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #5C4033;
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
      color: #5C4033;
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
      background: #fdf5f2;
      border-top: 1px solid #f0e7e2;
      padding: 16px;
    }

    .edit-panel-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: #5C4033;
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
      border: 2px dashed #cbb5ae;
      border-radius: 6px;
      font-size: 0.75rem;
      color: #5C4033;
      cursor: pointer;
      text-align: center;
    }

    .image-upload-btn:hover {
      background: #f0e7e2;
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

    .about-img-slot {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .about-admin-row {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 16px;
      background: #fafafa;
    }

    .about-row-label {
      margin-bottom: 12px;
      font-size: 0.95rem;
    }

    .about-admin-pair {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .about-admin-pair.reversed {
      flex-direction: row-reverse;
    }

    .about-admin-text {
      flex: 1;
      min-width: 0;
    }

    .about-admin-img {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .about-img-preview-wrap {
      position: relative;
      display: inline-block;
    }

    .about-img-preview {
      width: 110px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
      border: 2px solid #e87722;
      display: block;
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

    .google-font-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #5C4033;
      color: #fff;
      font-size: 0.75rem;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .google-font-chip-remove {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      font-size: 0.9rem;
      line-height: 1;
      padding: 0;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  trips: Trip[] = [];
  reviews: Review[] = [];
  aboutText = '';
  aboutSaved = false;
  aboutPageContent = '';
  aboutSections: string[] = ['', '', ''];
  aboutPageSaved = false;
  aboutImageError = '';
  aboutPageImagePreview: string | null = null;
  aboutPageImages: string[] = [];
  readonly slotIndices = [0, 1, 2];
  faqItems: FaqItem[] = [];
  newFaqQuestion = '';
  newFaqAnswer = '';
  faqError = '';
  editingFaqId: number | null = null;
  faqEditForm = { question: '', answer: '' };
  faqEditError = '';
  instagramPosts: InstagramPost[] = [];
  newInstagramUrl = '';
  instagramError = '';
  heroPreview = 'italy_mountain.png';
  heroOverlayOpacity = 0;
  heroTextContent = 'Mazas grupas \u2013 lieli iespaidi';
  heroTextFont = 'inherit';
  heroTextBold = true;
  heroTextSize = 32;
  heroTextPosition = 'left';
  googleFonts = '';
  googleFontsList: string[] = [];
  newGoogleFont = '';
  heroSettingsSaved = false;

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
  readonly imageBaseUrl = '/images/';

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
    private aboutImageService: AboutImageService,
    private heroImageService: HeroImageService,
    private siteContentService: SiteContentService,
    private faqService: FaqService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.heroImageService.getHeroImage().subscribe({
      next: (res) => {
        if (res.path) {
          const src = '/images/' + res.path;
          this.heroPreview = src;
          this.adminState.heroImageSrc$.next(src);
        }
        this.heroOverlayOpacity = res.overlayOpacity ?? 0;
        this.heroTextContent = res.textContent || 'Mazas grupas \u2013 lieli iespaidi';
        this.heroTextFont = res.textFont || 'inherit';
        this.heroTextBold = res.textBold ?? true;
        this.heroTextSize = res.textSize || 32;
        this.heroTextPosition = res.textPosition || 'left';
        this.googleFonts = res.googleFonts || '';
        this.googleFontsList = this.googleFonts
          ? this.googleFonts.split(',').map(f => f.trim()).filter(Boolean)
          : [];
        this.googleFontsList.forEach(f => this.loadGoogleFont(f));
      },
      error: () => {}
    });
    this.siteContentService.get('about_text').subscribe({
      next: (res) => {
        this.aboutText = res.value;
        this.adminState.aboutText$.next(res.value);
      },
      error: () => { this.aboutText = this.adminState.aboutText$.value; }
    });
    this.siteContentService.get('about_page_content').subscribe({
      next: (res) => {
        this.aboutPageContent = res.value;
        const parts = res.value.split('\n\n');
        this.aboutSections = [parts[0] ?? '', parts[1] ?? '', parts[2] ?? ''];
        this.adminState.aboutPageContent$.next(res.value);
      },
      error: () => {
        this.aboutPageContent = this.adminState.aboutPageContent$.value;
        const parts = this.aboutPageContent.split('\n\n');
        this.aboutSections = [parts[0] ?? '', parts[1] ?? '', parts[2] ?? ''];
      }
    });
    this.aboutPageImagePreview = this.adminState.aboutPageImage$.value;
    this.loadFaqItems();
    this.loadAboutImages();
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
    this.heroImageService.uploadHeroImage(file).subscribe({
      next: (res) => {
        const src = '/images/' + res.path;
        this.heroPreview = src;
        this.adminState.heroImageSrc$.next(src);
        this.heroOverlayOpacity = res.overlayOpacity ?? 0;
        this.heroTextContent = res.textContent || 'Mazas grupas \u2013 lieli iespaidi';
        this.heroTextFont = res.textFont || 'inherit';
        this.heroTextBold = res.textBold ?? true;
        this.heroTextSize = res.textSize || 32;
        this.heroTextPosition = res.textPosition || 'left';
        this.googleFonts = res.googleFonts || '';
        this.googleFontsList = this.googleFonts
          ? this.googleFonts.split(',').map(f => f.trim()).filter(Boolean)
          : [];
      },
      error: () => {}
    });
  }

  saveHeroSettings(): void {
    this.heroImageService.updateSettings({
      overlayOpacity: this.heroOverlayOpacity,
      textContent: this.heroTextContent,
      textFont: this.heroTextFont,
      textBold: this.heroTextBold,
      textSize: this.heroTextSize,
      textPosition: this.heroTextPosition,
      googleFonts: this.googleFonts
    }).subscribe({
      next: () => {
        this.heroSettingsSaved = true;
        setTimeout(() => (this.heroSettingsSaved = false), 2000);
      },
      error: () => {}
    });
  }

  get googleFontOptions(): { value: string; label: string }[] {
    return this.googleFontsList.map(f => ({ value: "'" + f + "', sans-serif", label: f }));
  }

  addGoogleFont(): void {
    const name = this.newGoogleFont.trim();
    if (!name) return;
    if (this.googleFontsList.includes(name)) {
      this.newGoogleFont = '';
      return;
    }
    this.googleFontsList = [...this.googleFontsList, name];
    this.googleFonts = this.googleFontsList.join(',');
    this.loadGoogleFont(name);
    this.newGoogleFont = '';
  }

  removeGoogleFont(name: string): void {
    this.googleFontsList = this.googleFontsList.filter(f => f !== name);
    this.googleFonts = this.googleFontsList.join(',');
  }

  private loadGoogleFont(name: string): void {
    const encoded = name.trim().replace(/\s+/g, '+');
    const href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;700&display=swap`;
    if (!this.document.querySelector(`link[href="${href}"]`)) {
      const link = this.document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      this.document.head.appendChild(link);
    }
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
    this.siteContentService.save('about_text', this.aboutText).subscribe({
      next: (res) => {
        this.adminState.aboutText$.next(res.value);
        this.aboutSaved = true;
        setTimeout(() => (this.aboutSaved = false), 2000);
      },
      error: () => {}
    });
  }

  saveAboutPage(): void {
    const content = this.aboutSections.join('\n\n');
    this.siteContentService.save('about_page_content', content).subscribe({
      next: (res) => {
        this.aboutPageContent = res.value;
        this.adminState.aboutPageContent$.next(res.value);
        this.aboutPageSaved = true;
        setTimeout(() => (this.aboutPageSaved = false), 2000);
      },
      error: () => {}
    });
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

  loadAboutImages(): void {
    this.aboutImageService.getImages().subscribe({
      next: (imgs) => {
        const slots = ['', '', ''];
        imgs.forEach(img => { if (img.slotIndex >= 0 && img.slotIndex <= 2) slots[img.slotIndex] = '/images/' + img.path; });
        this.aboutPageImages = slots;
      },
      error: () => {}
    });
  }

  onAboutPageSideImageUpload(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.aboutImageError = '';
    this.aboutImageService.uploadImage(index, file).subscribe({
      next: (img) => {
        const updated = [...this.aboutPageImages];
        updated[index] = '/images/' + img.path;
        this.aboutPageImages = updated;
      },
      error: (err) => {
        this.aboutImageError = 'Attēla augšupielāde neizdevās. Pārbaudiet, vai backend darbojas (localhost:8080).';
        console.error('About image upload error:', err);
      }
    });
    input.value = '';
  }

  removeAboutPageSideImage(index: number): void {
    this.aboutImageError = '';
    this.aboutImageService.deleteImage(index).subscribe({
      next: () => {
        const updated = [...this.aboutPageImages];
        updated[index] = '';
        this.aboutPageImages = updated;
      },
      error: (err) => {
        this.aboutImageError = 'Attēla dzēšana neizdevās.';
        console.error('About image delete error:', err);
      }
    });
  }

  loadFaqItems(): void {
    this.faqService.getAll().subscribe({
      next: (items) => {
        this.faqItems = items;
        this.adminState.faqItems$.next(items.map(f => ({ id: String(f.id), question: f.question, answer: f.answer })));
      },
      error: () => {}
    });
  }

  addFaqItem(): void {
    this.faqError = '';
    if (!this.newFaqQuestion.trim() || !this.newFaqAnswer.trim()) {
      this.faqError = 'Jautājums un atbilde ir obligāti.';
      return;
    }
    this.faqService.create(this.newFaqQuestion.trim(), this.newFaqAnswer.trim()).subscribe({
      next: () => {
        this.newFaqQuestion = '';
        this.newFaqAnswer = '';
        this.loadFaqItems();
      },
      error: () => { this.faqError = 'Neizdevās pievienot jautājumu.'; }
    });
  }

  removeFaqItem(id: number): void {
    this.faqService.remove(id).subscribe({
      next: () => {
        if (this.editingFaqId === id) this.editingFaqId = null;
        this.loadFaqItems();
      },
      error: () => {}
    });
  }

  toggleFaqEdit(item: FaqItem): void {
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
    this.faqService.update(this.editingFaqId!, this.faqEditForm.question.trim(), this.faqEditForm.answer.trim()).subscribe({
      next: () => {
        this.editingFaqId = null;
        this.loadFaqItems();
      },
      error: () => { this.faqEditError = 'Neizdevās saglabāt izmaiņas.'; }
    });
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
