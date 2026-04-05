import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-dashboard">
      <nav class="navbar bg-dark text-white">
        <div class="container-fluid">
          <span class="navbar-brand mb-0 h1">Admin Panelis</span>
        </div>
      </nav>
      
      <div class="container-fluid mt-4">
        <h2>Admin Dashboard</h2>
        <p class="text-muted">Admin dashboard will be implemented here</p>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {}
