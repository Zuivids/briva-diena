import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-login-container">
      <div class="container mt-5">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="card">
              <div class="card-body">
                <h2 class="card-title text-center mb-4">Admin Pieeja</h2>
                <p class="text-muted">Admin login page will be implemented here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminLoginComponent {}
