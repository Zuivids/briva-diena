import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="trips-container">
      <div class="container mt-5">
        <h2>Ceļojumi</h2>
        <p class="text-muted">Trips list with filters will be implemented here</p>
      </div>
    </div>
  `
})
export class TripsComponent {}
