import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trip-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="trip-management-container">
      <div class="container-fluid mt-4">
        <h2>Ceļojumu Pārvaldīšana</h2>
        <p class="text-muted">Trip management page will be implemented here</p>
      </div>
    </div>
  `
})
export class TripManagementComponent {}
