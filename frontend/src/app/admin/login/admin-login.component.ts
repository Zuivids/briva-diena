import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminStateService } from '../../shared/services/admin-state.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-login-page">
      <div class="container">
        <div class="row justify-content-center align-items-center min-vh-100">
          <div class="col-11 col-sm-8 col-md-5 col-lg-4">
            <div class="login-card">
              <div class="text-center mb-4">
                <h2 class="login-title">Admin pieslēgšanās</h2>
              </div>
              <form (ngSubmit)="onLogin()">
                <div class="mb-3">
                  <label for="username" class="form-label">Lietotājvārds</label>
                  <input
                    id="username"
                    type="text"
                    [(ngModel)]="username"
                    name="username"
                    class="form-control"
                    placeholder="Lietotājvārds"
                    required
                    autocomplete="username"
                  />
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label">Parole</label>
                  <input
                    id="password"
                    type="password"
                    [(ngModel)]="password"
                    name="password"
                    class="form-control"
                    placeholder="••••••"
                    required
                    autocomplete="current-password"
                  />
                </div>
                <div *ngIf="error" class="alert alert-danger py-2 small mb-3" role="alert">
                  Nepareizs lietotājvārds vai parole.
                </div>
                <button type="submit" class="btn btn-primary w-100">Pieslēgties</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-page {
      background: #f0f2f8;
      min-height: 100vh;
    }
    .login-card {
      background: #fff;
      border-radius: 14px;
      padding: 40px 36px 36px;
      box-shadow: 0 6px 32px rgba(0, 0, 0, 0.1);
    }
    .login-title {
      font-size: 1.35rem;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0;
    }
    .form-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #333;
    }
    .btn-primary {
      background: #0d6efd;
      border: none;
      padding: 10px;
      font-size: 0.95rem;
      font-weight: 500;
      border-radius: 8px;
    }
    .btn-primary:hover {
      background: #0b5ed7;
    }
  `]
})
export class AdminLoginComponent {
  username = '';
  password = '';
  error = false;

  constructor(private adminState: AdminStateService, private router: Router) {}

  onLogin(): void {
    this.error = false;
    if (this.adminState.login(this.username, this.password)) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.error = true;
    }
  }
}
