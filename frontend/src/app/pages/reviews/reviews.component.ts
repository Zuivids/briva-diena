import { Component } from '@angular/core';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [],
  template: `
    <div class="reviews-page">
      <div class="container py-5">
        <h2 class="page-title mb-5">ATSAUKSMES</h2>
        <div class="elfsight-app-6601583c-d804-470b-9bd7-9fc8d21ba0c3" data-elfsight-app-lazy></div>
      </div>
    </div>
  `,
  styles: [`
    .reviews-page {
      min-height: 100vh;
      background: #f8f9fc;
    }

    .page-title {
      color: #5C4033;
      font-weight: 700;
      text-align: center;
    }
  `]
})
export class ReviewsComponent {}

