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
                    <td class="action-cell">
                      <button class="btn-pdf" (click)="downloadPdf(r)">PDF</button>
                      <button class="btn-delete" (click)="deleteRegistration(r)">Dzēst</button>
                    </td>
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

    <!-- Delete confirmation modal -->
    <div *ngIf="deleteTarget" class="modal-backdrop" (click)="cancelDelete()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </div>
        <h3 class="modal-title">Dzēst pieteikumu?</h3>
        <p class="modal-body">
          Vai tiešām vēlaties neatgriezeniski dzēst pieteikumu:
          <strong>{{ deleteTarget!.firstName }} {{ deleteTarget!.lastName }}</strong>?
        </p>
        <div class="modal-actions">
          <button class="modal-btn-cancel" (click)="cancelDelete()">Atcelt</button>
          <button class="modal-btn-confirm" (click)="confirmDelete()">Dzēst</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reg-admin-page {
      min-height: 100vh;
      background: #faf5f3;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #5C4033;
      margin: 0;
    }

    .badge-count {
      background: #f0e7e2;
      color: #5C4033;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 20px;
    }

    .table-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(92, 64, 51, 0.07);
      overflow: hidden;
    }

    .reg-table thead th {
      background: #5C4033;
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
      border-color: #faf0ed;
    }

    .reg-table tbody tr:hover {
      background: #f8faff;
    }

    .email-link {
      color: #5C4033;
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
      background: #f0e7e2;
      padding: 6px 8px;
    }

    .filter-input {
      width: 100%;
      border: 1px solid #cbb5ae;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 0.78rem;
      background: #fff;
      color: #2e1a15;
      outline: none;
    }

    .filter-input:focus {
      border-color: #5C4033;
      box-shadow: 0 0 0 2px rgba(92,64,51,0.12);
    }

    .filter-select {
      appearance: auto;
    }

    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #fdf8f6;
      border-top: 1px solid #f0e7e2;
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
      border: 1px solid #cbb5ae;
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
      border: 1px solid #cbb5ae;
      border-radius: 6px;
      width: 30px;
      height: 30px;
      font-size: 1.1rem;
      line-height: 1;
      cursor: pointer;
      color: #5C4033;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }

    .page-btn:hover:not(:disabled) { background: #f0e7e2; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .page-num {
      font-size: 0.85rem;
      color: #333;
      min-width: 54px;
      text-align: center;
    }

    .btn-pdf {
      background: #5C4033;
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
      background: #3d2a22;
    }

    .companion-row {
      background: #fdf5f2;
    }

    .companion-row:hover {
      background: #f5e6df !important;
    }

    .companion-badge {
      color: #5C4033;
      font-size: 1rem;
      margin-right: 2px;
    }

    .companion-id {
      padding-left: 10px;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(30, 15, 10, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(2px);
    }

    .modal-box {
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 8px 40px rgba(92, 64, 51, 0.18);
      padding: 36px 40px 28px;
      max-width: 420px;
      width: 90%;
      text-align: center;
      animation: modalIn 0.18s ease;
    }

    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.94) translateY(-10px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    .modal-icon {
      font-size: 2.2rem;
      margin-bottom: 12px;
    }

    .modal-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #5C4033;
      margin: 0 0 10px;
    }

    .modal-body {
      font-size: 0.9rem;
      color: #444;
      margin: 0 0 24px;
      line-height: 1.5;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .modal-btn-cancel {
      background: #f0e7e2;
      color: #5C4033;
      border: none;
      border-radius: 8px;
      padding: 8px 24px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }

    .modal-btn-cancel:hover {
      background: #e8d5ce;
    }

    .modal-btn-confirm {
      background: #dc2626;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 8px 24px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }

    .modal-btn-confirm:hover {
      background: #991b1b;
    }

    .action-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }

    .btn-delete {
      background: #dc2626;
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

    .btn-delete:hover {
      background: #991b1b;
    }
  `]
})
export class AdminRegistrationsComponent implements OnInit {
  registrations: RegistrationRow[] = [];
  loading = true;
  error = '';
  deleteTarget: RegistrationRow | null = null;

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

  deleteRegistration(r: RegistrationRow): void {
    this.deleteTarget = r;
  }

  cancelDelete(): void {
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    const r = this.deleteTarget!;
    this.deleteTarget = null;
    this.http.delete(`${this.apiUrl}/${r.id}`).subscribe({
      next: () => {
        this.registrations = this.registrations.filter(reg => reg.id !== r.id);
      },
      error: () => { this.error = 'Neizdevās dzēst pieteikumu.'; }
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
