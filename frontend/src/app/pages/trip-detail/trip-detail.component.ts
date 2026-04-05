import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="trip-detail-container">
      <div class="container mt-5">
        <h2>Trip Detail</h2>
        <p class="text-muted">Trip detail page will be implemented here</p>
      </div>
    </div>
  `
})
export class TripDetailComponent {}
