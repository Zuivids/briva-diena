import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { GoogleReviewsService, GoogleReviewsData, GoogleReview } from '../../services/google-reviews.service';

const AVATAR_COLORS = ['#e87722', '#5C4033', '#2f6f4f', '#3a5a8c', '#8c3a5a', '#a87c3f'];

@Component({
  selector: 'app-google-reviews',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <section class="reviews-section py-5" *ngIf="data && data.reviews.length > 0">
      <div class="container">
        <h2 class="section-title mb-4">ATSAUKSMES</h2>

        <div class="reviews-summary mb-4">
          <div class="summary-rating">{{ data.overallRating | number:'1.1-1' }}</div>
          <div>
            <div class="summary-stars">
              <span *ngFor="let s of fullStars(data.overallRating)" class="star">★</span>
            </div>
            <div class="summary-label">Google atsauksmes &middot; {{ data.totalRatingCount }}</div>
          </div>
          <a *ngIf="data.placeUrl" [href]="data.placeUrl" target="_blank" rel="noopener noreferrer" class="review-us-btn">
            Vērtēt mūs Google
          </a>
        </div>

        <div class="row g-4">
          <div class="col-md-4" *ngFor="let r of data.reviews.slice(0, 5)">
            <div class="review-card">
              <div class="review-card-header">
                <img *ngIf="r.authorPhotoUrl" [src]="r.authorPhotoUrl" [alt]="r.authorName" class="review-avatar" />
                <div *ngIf="!r.authorPhotoUrl" class="review-avatar review-avatar-fallback" [style.background]="avatarColor(r.authorName)">
                  {{ initials(r.authorName) }}
                </div>
                <div class="review-author-block">
                  <div class="review-author">
                    {{ r.authorName }}
                    <svg class="google-badge" viewBox="0 0 24 24" width="13" height="13" title="Google atsauksme">
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"/>
                      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.4 7.4 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.4 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.6H1.4C.5 8.3 0 10.1 0 12s.5 3.7 1.4 5.4l4-3.1z"/>
                      <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.6 1.4 6.6l4 3.1c.9-2.8 3.5-4.9 6.6-4.9z"/>
                    </svg>
                  </div>
                  <div class="review-time">{{ r.relativeTimeDescription }}</div>
                </div>
              </div>
              <div class="review-stars mb-2">
                <span *ngFor="let s of fullStars(r.rating)" class="star">★</span>
              </div>
              <p class="review-text">
                {{ truncate(r.text) }}
                <button *ngIf="r.text.length > 150" class="read-more-btn" (click)="openModal()">Lasīt vairāk</button>
              </p>
            </div>
          </div>
        </div>

        <div class="text-center mt-4">
          <button class="view-all-btn" (click)="openModal()">Skatīt visas atsauksmes</button>
        </div>
      </div>

      <div class="modal-backdrop" *ngIf="modalOpen" (click)="closeModal()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <button class="modal-close" (click)="closeModal()" aria-label="Aizvērt">&times;</button>
          <h3 class="modal-title mb-3">Visas atsauksmes</h3>
          <div class="modal-review" *ngFor="let r of data.reviews">
            <div class="review-card-header">
              <img *ngIf="r.authorPhotoUrl" [src]="r.authorPhotoUrl" [alt]="r.authorName" class="review-avatar" />
              <div *ngIf="!r.authorPhotoUrl" class="review-avatar review-avatar-fallback" [style.background]="avatarColor(r.authorName)">
                {{ initials(r.authorName) }}
              </div>
              <div class="review-author-block">
                <div class="review-author">{{ r.authorName }}</div>
                <div class="review-time">{{ r.relativeTimeDescription }}</div>
              </div>
            </div>
            <div class="review-stars mb-2">
              <span *ngFor="let s of fullStars(r.rating)" class="star">★</span>
            </div>
            <p class="review-text">{{ r.text }}</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .section-title { color: #5C4033; text-align: center; font-weight: 700; }

    .reviews-summary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
      text-align: center;
    }

    .summary-rating {
      font-size: 2.2rem;
      font-weight: 700;
      color: #5C4033;
      line-height: 1;
    }

    .summary-stars { line-height: 1; }

    .summary-label {
      font-size: 0.82rem;
      color: #888;
      margin-top: 2px;
    }

    .star {
      color: #f5a623;
      font-size: 1.1rem;
    }

    .review-us-btn {
      background: #5C4033;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 9px 20px;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      transition: background 0.15s;
    }
    .review-us-btn:hover { background: #3d2a22; color: #fff; }

    .review-card {
      background: #fff;
      border: 1px solid #e8ebf4;
      border-radius: 10px;
      padding: 20px;
      height: 100%;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .review-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }

    .review-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }

    .review-avatar-fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .review-author-block { min-width: 0; }

    .review-author {
      display: flex;
      align-items: center;
      gap: 5px;
      font-weight: 600;
      font-size: 0.9rem;
      color: #333;
    }

    .google-badge { flex-shrink: 0; }

    .review-time {
      font-size: 0.75rem;
      color: #999;
    }

    .review-text {
      font-size: 0.88rem;
      color: #555;
      line-height: 1.6;
      margin: 0;
    }

    .read-more-btn {
      background: none;
      border: none;
      color: #e87722;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0 0 0 4px;
    }

    .view-all-btn {
      background: transparent;
      color: #5C4033;
      border: 1.5px solid #5C4033;
      border-radius: 8px;
      padding: 9px 24px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .view-all-btn:hover { background: #5C4033; color: #fff; }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(30, 15, 10, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      padding: 24px;
    }

    .modal-box {
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 8px 40px rgba(92, 64, 51, 0.18);
      padding: 32px;
      max-width: 640px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
    }

    .modal-close {
      position: absolute;
      top: 14px;
      right: 16px;
      background: none;
      border: none;
      font-size: 1.4rem;
      line-height: 1;
      color: #888;
      cursor: pointer;
    }

    .modal-title {
      color: #5C4033;
      font-weight: 700;
    }

    .modal-review {
      border-bottom: 1px solid #f0f2f8;
      padding: 14px 0;
    }
    .modal-review:last-child { border-bottom: none; padding-bottom: 0; }
    .modal-review:first-of-type { padding-top: 0; }
  `]
})
export class GoogleReviewsComponent implements OnInit {
  data: GoogleReviewsData | null = null;
  modalOpen = false;

  constructor(private googleReviewsService: GoogleReviewsService) {}

  ngOnInit(): void {
    this.googleReviewsService.get().subscribe({
      next: (data) => (this.data = data),
      error: () => {}
    });
  }

  fullStars(rating: number | null | undefined): number[] {
    return Array(Math.round(rating || 0)).fill(0);
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0])
      .join('')
      .toUpperCase();
  }

  avatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  truncate(text: string, len = 150): string {
    if (!text) return '';
    return text.length > len ? text.slice(0, len).trim() + '…' : text;
  }

  openModal(): void {
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
  }
}
