import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginResponse } from '../../shared/services/auth.service';
import QRCode from 'qrcode';

type LoginStep = 'credentials' | 'mfa-setup' | 'mfa-verify';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-login-page">
      <div class="container">
        <div class="row justify-content-center align-items-center min-vh-100">
          <div class="col-11 col-sm-9 col-md-5 col-lg-4">
            <div class="login-card">

              <!-- Step 1: Username + Password -->
              <ng-container *ngIf="step === 'credentials'">
                <div class="text-center mb-4">
                  <h2 class="login-title">Admin pieslēgšanās</h2>
                </div>
                <form (ngSubmit)="onLogin()">
                  <div class="mb-3">
                    <label for="username" class="form-label">Lietotājvārds</label>
                    <input id="username" type="text" [(ngModel)]="username" name="username"
                           class="form-control" placeholder="Lietotājvārds"
                           required autocomplete="username" />
                  </div>
                  <div class="mb-3">
                    <label for="password" class="form-label">Parole</label>
                    <input id="password" type="password" [(ngModel)]="password" name="password"
                           class="form-control" placeholder="••••••"
                           required autocomplete="current-password" />
                  </div>
                  <div *ngIf="error" class="alert alert-danger py-2 small mb-3" role="alert">{{ error }}</div>
                  <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                    Pieslēgties
                  </button>
                </form>
              </ng-container>

              <!-- Step 2a: First-time MFA setup — scan QR code then enter first code -->
              <ng-container *ngIf="step === 'mfa-setup'">
                <div class="text-center mb-3">
                  <h2 class="login-title">Drošības iestatīšana</h2>
                  <p class="text-muted small mt-2">
                    Skenē QR kodu ar autentifikācijas lietotni<br>
                    (Google Authenticator, Authy vai līdzīgu).
                  </p>
                </div>
                <div class="text-center mb-3">
                  <img *ngIf="qrCodeDataUrl" [src]="qrCodeDataUrl" alt="TOTP QR Code" class="qr-code" />
                </div>
                <div class="secret-box mb-3">
                  <span class="small text-muted d-block mb-1">Vai ievadi manuālo kodu:</span>
                  <code class="secret-text">{{ totpSecret }}</code>
                </div>
                <form (ngSubmit)="onVerifyMfa()">
                  <div class="mb-3">
                    <label for="totpCode" class="form-label">6-ciparu kods no lietotnes</label>
                    <input id="totpCode" type="text" inputmode="numeric" pattern="[0-9]{6}"
                           [(ngModel)]="totpCode" name="totpCode"
                           class="form-control totp-input"
                           placeholder="000000" maxlength="6"
                           required autocomplete="one-time-code" />
                  </div>
                  <div *ngIf="error" class="alert alert-danger py-2 small mb-3" role="alert">{{ error }}</div>
                  <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                    Apstiprināt un ielogoties
                  </button>
                </form>
              </ng-container>

              <!-- Step 2b: Ongoing MFA — enter code only -->
              <ng-container *ngIf="step === 'mfa-verify'">
                <div class="text-center mb-4">
                  <h2 class="login-title">Divfaktoru autentifikācija</h2>
                  <p class="text-muted small mt-2">Ievadi 6-ciparu kodu no autentifikācijas lietotnes.</p>
                </div>
                <form (ngSubmit)="onVerifyMfa()">
                  <div class="mb-3">
                    <label for="totpCode2" class="form-label">Autentifikācijas kods</label>
                    <input id="totpCode2" type="text" inputmode="numeric" pattern="[0-9]{6}"
                           [(ngModel)]="totpCode" name="totpCode"
                           class="form-control totp-input"
                           placeholder="000000" maxlength="6"
                           required autocomplete="one-time-code" />
                  </div>
                  <div *ngIf="error" class="alert alert-danger py-2 small mb-3" role="alert">{{ error }}</div>
                  <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                    Pieslēgties
                  </button>
                  <button type="button" class="btn btn-link w-100 mt-2 small text-muted"
                          (click)="backToCredentials()">← Atpakaļ</button>
                </form>
              </ng-container>

            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-page { background: #f0f2f8; min-height: 100vh; }
    .login-card {
      background: #fff;
      border-radius: 14px;
      padding: 40px 36px 36px;
      box-shadow: 0 6px 32px rgba(0,0,0,.1);
    }
    .login-title { font-size: 1.35rem; font-weight: 600; color: #1a1a2e; margin: 0; }
    .form-label { font-size: .875rem; font-weight: 500; color: #333; }
    .btn-primary {
      background: #0d6efd; border: none; padding: 10px;
      font-size: .95rem; font-weight: 500; border-radius: 8px;
    }
    .btn-primary:hover:not(:disabled) { background: #0b5ed7; }
    .qr-code { width: 180px; height: 180px; border: 1px solid #dee2e6; border-radius: 8px; padding: 4px; }
    .secret-box {
      background: #f8f9fa; border: 1px dashed #ced4da;
      border-radius: 8px; padding: 10px 14px; text-align: center;
    }
    .secret-text { font-size: .9rem; letter-spacing: 2px; color: #1a1a2e; word-break: break-all; }
    .totp-input { font-size: 1.6rem; letter-spacing: 8px; text-align: center; font-weight: 600; }
  `]
})
export class AdminLoginComponent implements OnInit {
  step: LoginStep = 'credentials';

  username = '';
  password = '';
  totpCode = '';
  error: string | null = null;
  loading = false;

  preToken = '';
  totpSecret = '';
  qrCodeDataUrl = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onLogin(): void {
    this.error = null;
    this.loading = true;
    this.authService.login(this.username, this.password).subscribe({
      next: (res: LoginResponse) => {
        this.loading = false;
        this.preToken = res.preToken!;
        if (res.mfaSetupRequired) {
          this.totpSecret = res.secret!;
          this.generateQrCode(res.qrCodeUri!);
          this.step = 'mfa-setup';
        } else {
          this.step = 'mfa-verify';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Nepareizs lietotājvārds vai parole.';
      }
    });
  }

  onVerifyMfa(): void {
    if (this.totpCode.length !== 6) {
      this.error = 'Ievadi 6-ciparu kodu.';
      return;
    }
    this.error = null;
    this.loading = true;
    this.authService.verifyMfa(this.preToken, this.totpCode).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/dashboard']);
      },
      error: () => {
        this.loading = false;
        this.totpCode = '';
        this.error = 'Nepareizs autentifikācijas kods. Mēģini vēlreiz.';
      }
    });
  }

  backToCredentials(): void {
    this.step = 'credentials';
    this.preToken = '';
    this.totpCode = '';
    this.error = null;
  }

  private generateQrCode(uri: string): void {
    QRCode.toDataURL(uri, { width: 180, margin: 1 })
      .then(url => { this.qrCodeDataUrl = url; })
      .catch(() => { this.qrCodeDataUrl = ''; });
  }
}
