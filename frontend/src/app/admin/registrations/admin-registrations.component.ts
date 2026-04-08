import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface RegistrationRow {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  personalIdNumber: string;
  passportNumber?: string;
  passportExpirationDate?: string;
  status: string;
  createdAt: string;
  trip?: { id: number; name: string };
  updating?: boolean;
}

@Component({
  selector: 'app-admin-registrations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reg-admin-page">
      <div class="container-fluid py-4 px-4">

        <div class="page-header mb-4">
          <h2 class="page-title">Pieteikumi</h2>
          <span class="badge-count">{{ registrations.length }} kopā</span>
        </div>

        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

        <div *ngIf="!loading && registrations.length === 0 && !error" class="empty-state">
          <p class="text-muted">Nav neviena pieteikuma.</p>
        </div>

        <div *ngIf="!loading && registrations.length > 0" class="table-card">
          <div class="table-responsive">
            <table class="table reg-table mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vārds Uzvārds</th>
                  <th>Telefons</th>
                  <th>E-pasts</th>
                  <th>Personas kods</th>
                  <th>Pase / ID</th>
                  <th>Pases der. termiņš</th>
                  <th>Ceļojums</th>
                  <th>Statuss</th>
                  <th>Reģistrācijas datums</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of registrations">
                  <td class="text-muted small">{{ r.id }}</td>
                  <td class="fw-semibold">{{ r.firstName }} {{ r.lastName }}</td>
                  <td>{{ r.phone }}</td>
                  <td>
                    <a [href]="'mailto:' + r.email" class="email-link">{{ r.email }}</a>
                  </td>
                  <td>{{ r.personalIdNumber || 'â€”' }}</td>
                  <td>{{ r.passportNumber || 'â€”' }}</td>
                  <td>{{ r.passportExpirationDate ? (r.passportExpirationDate | date:'dd.MM.yyyy') : 'â€”' }}</td>
                  <td>{{ r.trip?.name || 'â€”' }}</td>
                  <td>
                    <div class="status-cell">
                      <select [(ngModel)]="r.status"
                              (change)="updateStatus(r)"
                              [disabled]="!!r.updating"
                              class="status-select"
                              [class]="'status-select status-' + (r.status | lowercase)">
                        <option value="PENDING">Gaida</option>
                        <option value="CONFIRMED">Apstiprināts</option>
                        <option value="CANCELLED">Atcelts</option>
                      </select>
                      <span *ngIf="r.updating" class="spinner-border spinner-border-sm ms-1 text-primary"></span>
                    </div>
                  </td>
                  <td class="text-muted small">{{ r.createdAt | date:'dd.MM.yyyy HH:mm' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .reg-admin-page {
      min-height: 100vh;
      background: #f4f6fb;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1746a0;
      margin: 0;
    }

    .badge-count {
      background: #e8eef8;
      color: #1746a0;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 20px;
    }

    .table-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(23, 70, 160, 0.07);
      overflow: hidden;
    }

    .reg-table thead th {
      background: #1746a0;
      color: #fff;
      font-size: 0.78rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 12px 14px;
      border: none;
      white-space: nowrap;
    }

    .reg-table tbody td {
      padding: 11px 14px;
      font-size: 0.875rem;
      vertical-align: middle;
      border-color: #f0f3fa;
    }

    .reg-table tbody tr:hover {
      background: #f8faff;
    }

    .email-link {
      color: #1746a0;
      text-decoration: none;
    }

    .email-link:hover {
      text-decoration: underline;
    }

    .status-cell {
      display: flex;
      align-items: center;
    }

    .status-select {
      border: none;
      border-radius: 20px;
      padding: 4px 10px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      appearance: auto;
      outline: none;
    }

    .status-select:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-confirmed {
      background: #d1fae5;
      color: #065f46;
    }

    .status-cancelled {
      background: #fee2e2;
      color: #991b1b;
    }

    .empty-state {
      text-align: center;
      padding: 60px 0;
    }
  `]
})
export class AdminRegistrationsComponent implements OnInit {
  registrations: RegistrationRow[] = [];
  loading = true;
  error = '';

  private readonly apiUrl = 'http://localhost:8080/api/registrations';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<RegistrationRow[]>(this.apiUrl).subscribe({
      next: (data) => { this.registrations = data; this.loading = false; },
      error: () => { this.error = 'NeizdevÄs ielÄdÄ“t pieteikumus.'; this.loading = false; }
    });
  }

  updateStatus(r: RegistrationRow): void {
    r.updating = true;
    this.http.put<RegistrationRow>(`${this.apiUrl}/${r.id}`, { status: r.status }).subscribe({
      next: () => { r.updating = false; },
      error: () => { r.updating = false; }
    });
  }
}
