import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PdfService } from '../../shared/services/pdf.service';

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
  parentId?: number;
  companions?: RegistrationRow[];
  trip?: { id: number; name: string; startDate?: string; endDate?: string; priceCents?: number };
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
          <span class="badge-count">{{ filtered.length }} no {{ registrations.length }}</span>
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
                  <th>Ceļojuma datums</th>
                  <th>Statuss</th>
                  <th>Reģistrācijas datums</th>
                  <th></th>
                </tr>
                <tr class="filter-row">
                  <th></th>
                  <th><input type="text" [(ngModel)]="filterName" (ngModelChange)="onFilterChange()" class="filter-input" placeholder="Meklēt..." /></th>
                  <th><input type="text" [(ngModel)]="filterPhone" (ngModelChange)="onFilterChange()" class="filter-input" placeholder="Meklēt..." /></th>
                  <th><input type="text" [(ngModel)]="filterEmail" (ngModelChange)="onFilterChange()" class="filter-input" placeholder="Meklēt..." /></th>
                  <th><input type="text" [(ngModel)]="filterPersonalId" (ngModelChange)="onFilterChange()" class="filter-input" placeholder="Meklēt..." /></th>
                  <th><input type="text" [(ngModel)]="filterPassport" (ngModelChange)="onFilterChange()" class="filter-input" placeholder="Meklēt..." /></th>
                  <th><input type="text" [(ngModel)]="filterPassportExpiry" (ngModelChange)="onFilterChange()" class="filter-input" placeholder="dd.mm.gggg" /></th>
                  <th><input type="text" [(ngModel)]="filterTrip" (ngModelChange)="onFilterChange()" class="filter-input" placeholder="Meklēt..." /></th>
                  <th><input type="text" [(ngModel)]="filterTripDate" (ngModelChange)="onFilterChange()" class="filter-input" placeholder="dd.mm.gggg" /></th>
                  <th>
                    <select [(ngModel)]="filterStatus" (ngModelChange)="onFilterChange()" class="filter-input filter-select">
                      <option value="">Visi</option>
                      <option value="PENDING">Gaida</option>
                      <option value="CONFIRMED">Apstiprināts</option>
                      <option value="CANCELLED">Atcelts</option>
                    </select>
                  </th>
                  <th><input type="text" [(ngModel)]="filterCreatedAt" (ngModelChange)="onFilterChange()" class="filter-input" placeholder="dd.mm.gggg" /></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <ng-container *ngFor="let r of paged">
                  <tr>
                    <td class="text-muted small">{{ r.id }}</td>
                    <td class="fw-semibold">{{ r.firstName }} {{ r.lastName }}</td>
                    <td>{{ r.phone }}</td>
                    <td>
                      <a [href]="'mailto:' + r.email" class="email-link">{{ r.email }}</a>
                    </td>
                    <td>{{ r.personalIdNumber || '—' }}</td>
                    <td>{{ r.passportNumber || '—' }}</td>
                    <td>{{ r.passportExpirationDate ? (r.passportExpirationDate | date:'dd.MM.yyyy') : '—' }}</td>
                    <td>{{ r.trip?.name || '—' }}</td>
                    <td class="text-muted small">
                      <span *ngIf="r.trip?.startDate">{{ r.trip!.startDate | date:'dd.MM.yyyy' }} – {{ r.trip!.endDate | date:'dd.MM.yyyy' }}</span>
                      <span *ngIf="!r.trip?.startDate">—</span>
                    </td>
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
                    <td><button class="btn-pdf" (click)="downloadPdf(r)">PDF</button></td>
                  </tr>
                  <!-- Companion rows linked to this registration -->
                  <tr *ngFor="let c of r.companions" class="companion-row">
                    <td class="text-muted small companion-id">
                      <span class="companion-badge">&#8627;</span> {{ c.id }}
                    </td>
                    <td>{{ c.firstName }} {{ c.lastName }}</td>
                    <td>{{ c.phone }}</td>
                    <td>
                      <a [href]="'mailto:' + c.email" class="email-link">{{ c.email }}</a>
                    </td>
                    <td>{{ c.personalIdNumber || '—' }}</td>
                    <td>{{ c.passportNumber || '—' }}</td>
                    <td>{{ c.passportExpirationDate ? (c.passportExpirationDate | date:'dd.MM.yyyy') : '—' }}</td>
                    <td>{{ c.trip?.name || '—' }}</td>
                    <td class="text-muted small">
                      <span *ngIf="c.trip?.startDate">{{ c.trip!.startDate | date:'dd.MM.yyyy' }} – {{ c.trip!.endDate | date:'dd.MM.yyyy' }}</span>
                      <span *ngIf="!c.trip?.startDate">—</span>
                    </td>
                    <td>
                      <div class="status-cell">
                        <select [(ngModel)]="c.status"
                                (change)="updateStatus(c)"
                                [disabled]="!!c.updating"
                                class="status-select"
                                [class]="'status-select status-' + (c.status | lowercase)">
                          <option value="PENDING">Gaida</option>
                          <option value="CONFIRMED">Apstiprināts</option>
                          <option value="CANCELLED">Atcelts</option>
                        </select>
                        <span *ngIf="c.updating" class="spinner-border spinner-border-sm ms-1 text-primary"></span>
                      </div>
                    </td>
                    <td class="text-muted small">{{ c.createdAt | date:'dd.MM.yyyy HH:mm' }}</td>
                    <td></td>
                  </tr>
                </ng-container>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination-bar">
            <div class="page-size-wrap">
              <span>Rādīt:</span>
              <select [(ngModel)]="pageSize" (ngModelChange)="onFilterChange()" class="page-size-select">
                <option [ngValue]="10">10</option>
                <option [ngValue]="25">25</option>
                <option [ngValue]="50">50</option>
                <option [ngValue]="100">100</option>
              </select>
              <span>ierakstus</span>
            </div>
            <div class="page-info">
              {{ filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1 }}–{{ currentPage * pageSize > filtered.length ? filtered.length : currentPage * pageSize }} no {{ filtered.length }}
            </div>
            <div class="page-nav">
              <button class="page-btn" [disabled]="currentPage === 1" (click)="currentPage = currentPage - 1">&#8249;</button>
              <span class="page-num">{{ currentPage }} / {{ pageCount }}</span>
              <button class="page-btn" [disabled]="currentPage >= pageCount" (click)="currentPage = currentPage + 1">&#8250;</button>
            </div>
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

    .filter-row th {
      background: #e8eef8;
      padding: 6px 8px;
    }

    .filter-input {
      width: 100%;
      border: 1px solid #c8d4ec;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 0.78rem;
      background: #fff;
      color: #1a1a2e;
      outline: none;
    }

    .filter-input:focus {
      border-color: #1746a0;
      box-shadow: 0 0 0 2px rgba(23,70,160,0.12);
    }

    .filter-select {
      appearance: auto;
    }

    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #f8faff;
      border-top: 1px solid #e8eef8;
      flex-wrap: wrap;
      gap: 10px;
    }

    .page-size-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: #555;
    }

    .page-size-select {
      border: 1px solid #c8d4ec;
      border-radius: 6px;
      padding: 3px 8px;
      font-size: 0.82rem;
      background: #fff;
      cursor: pointer;
    }

    .page-info {
      font-size: 0.85rem;
      color: #555;
    }

    .page-nav {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-btn {
      background: #fff;
      border: 1px solid #c8d4ec;
      border-radius: 6px;
      width: 30px;
      height: 30px;
      font-size: 1.1rem;
      line-height: 1;
      cursor: pointer;
      color: #1746a0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }

    .page-btn:hover:not(:disabled) { background: #e8eef8; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .page-num {
      font-size: 0.85rem;
      color: #333;
      min-width: 54px;
      text-align: center;
    }

    .btn-pdf {
      background: #1746a0;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 4px 12px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s;
    }

    .btn-pdf:hover {
      background: #5C4033;
    }

    .companion-row {
      background: #f0f5ff;
    }

    .companion-row:hover {
      background: #e4ecff !important;
    }

    .companion-badge {
      color: #1746a0;
      font-size: 1rem;
      margin-right: 2px;
    }

    .companion-id {
      padding-left: 10px;
    }
  `]
})
export class AdminRegistrationsComponent implements OnInit {
  registrations: RegistrationRow[] = [];
  loading = true;
  error = '';

  // Filters
  filterName = '';
  filterPhone = '';
  filterEmail = '';
  filterPersonalId = '';
  filterPassport = '';
  filterPassportExpiry = '';
  filterTrip = '';
  filterTripDate = '';
  filterStatus = '';
  filterCreatedAt = '';

  // Pagination
  pageSize = 25;
  currentPage = 1;

  private fmt(date: string | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
  }

  get filtered(): RegistrationRow[] {
    const name = this.filterName.toLowerCase();
    const phone = this.filterPhone.toLowerCase();
    const email = this.filterEmail.toLowerCase();
    const personalId = this.filterPersonalId.toLowerCase();
    const passport = this.filterPassport.toLowerCase();
    const passportExpiry = this.filterPassportExpiry.toLowerCase();
    const trip = this.filterTrip.toLowerCase();
    const tripDate = this.filterTripDate.toLowerCase();
    const createdAt = this.filterCreatedAt.toLowerCase();
    return this.registrations.filter(r => {
      if (name && !`${r.firstName} ${r.lastName}`.toLowerCase().includes(name)) return false;
      if (phone && !r.phone.toLowerCase().includes(phone)) return false;
      if (email && !r.email.toLowerCase().includes(email)) return false;
      if (personalId && !(r.personalIdNumber ?? '').toLowerCase().includes(personalId)) return false;
      if (passport && !(r.passportNumber ?? '').toLowerCase().includes(passport)) return false;
      if (passportExpiry && !this.fmt(r.passportExpirationDate).includes(passportExpiry)) return false;
      if (trip && !(r.trip?.name ?? '').toLowerCase().includes(trip)) return false;
      if (tripDate) {
        const range = `${this.fmt(r.trip?.startDate)} – ${this.fmt(r.trip?.endDate)}`;
        if (!range.toLowerCase().includes(tripDate)) return false;
      }
      if (this.filterStatus && r.status !== this.filterStatus) return false;
      if (createdAt && !this.fmt(r.createdAt).includes(createdAt)) return false;
      return true;
    });
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get paged(): RegistrationRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  private readonly apiUrl = '/api/registrations';

  constructor(private http: HttpClient, private pdfService: PdfService) {}

  ngOnInit(): void {
    this.http.get<RegistrationRow[]>(this.apiUrl).subscribe({
      next: (data) => {
        // Build parent-child tree
        const byId = new Map<number, RegistrationRow>();
        data.forEach(r => { r.companions = []; byId.set(r.id, r); });
        data.forEach(r => {
          if (r.parentId) {
            const parent = byId.get(r.parentId);
            if (parent) parent.companions!.push(r);
          }
        });
        // Only main registrations (no parentId) appear as top-level rows
        this.registrations = data.filter(r => !r.parentId);
        this.loading = false;
      },
      error: () => { this.error = 'Neizdevās ielādēt pieteikumus.'; this.loading = false; }
    });
  }

  downloadPdf(r: RegistrationRow): void {
    this.pdfService.downloadAgreement({
      firstName: r.firstName,
      lastName: r.lastName,
      personalId: r.personalIdNumber ?? '',
      email: r.email,
      phone: r.phone,
      tripName: r.trip?.name,
      tripStartDate: r.trip?.startDate ? new Date(r.trip.startDate).toLocaleDateString('lv-LV') : undefined,
      tripEndDate: r.trip?.endDate ? new Date(r.trip.endDate).toLocaleDateString('lv-LV') : undefined,
      tripPriceCents: r.trip?.priceCents,
      companions: (r.companions ?? []).map(c => ({
        firstName: c.firstName,
        lastName: c.lastName,
        personalId: c.personalIdNumber ?? '',
        phone: c.phone,
        email: c.email,
      })),
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
