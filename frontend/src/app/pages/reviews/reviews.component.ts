import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reviews-container">
      <div class="container mt-5">
        <h2>Atsauksmes</h2>
        <p class="text-muted">Reviews page will be implemented here</p>
      </div>
    </div>
  `
})
export class ReviewsComponent {}
