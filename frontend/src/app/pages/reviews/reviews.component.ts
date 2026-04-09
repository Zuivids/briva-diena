import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../shared/services/review.service';
import { Review } from '../../shared/models/review.model';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reviews-page">
      <div class="container py-5">
        <h2 class="page-title mb-4">Atsauksmes</h2>

        <div *ngIf="reviews.length > 0" class="row g-4">
          <div *ngFor="let review of reviews" class="col-md-6 col-lg-4">
            <div class="review-card">
              <div class="review-stars mb-2">
                <span *ngFor="let s of getStars(review.rating)" class="star">&#9733;</span>
                <span *ngFor="let s of getEmptyStars(review.rating)" class="star star-empty">&#9733;</span>
              </div>
              <p class="review-text">"{{ review.reviewText }}"</p>
              <p class="review-name">&#8212; {{ review.customerName }}</p>
            </div>
          </div>
        </div>

        <div *ngIf="reviews.length === 0 && !loading" class="empty-state">
          <p class="text-muted">Šobrīd nav atsauksmju.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reviews-page {
      min-height: 100vh;
      background: #f8f9fc;
    }

    .page-title {
      color: #e87722;
      font-weight: 700;
      text-align: center;
    }

    .review-card {
      background: #fff;
      border: 1px solid #e8ebf4;
      border-radius: 10px;
      padding: 24px;
      height: 100%;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .star {
      color: #f5a623;
      font-size: 1.1rem;
    }

    .star-empty {
      color: #ddd;
    }

    .review-text {
      font-size: 0.95rem;
      color: #555;
      font-style: italic;
      line-height: 1.6;
      margin-bottom: 12px;
    }

    .review-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .empty-state {
      text-align: center;
      padding: 60px 0;
    }
  `]
})
export class ReviewsComponent implements OnInit {
  reviews: Review[] = [];
  loading = true;

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.reviewService.getAllReviews().subscribe({
      next: (data) => { this.reviews = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(Math.max(0, 5 - rating)).fill(0);
  }
}
