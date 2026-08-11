import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsletterService, NewsletterSignup } from '../../shared/services/newsletter.service';

@Component({
  selector: 'app-admin-newsletter-signups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="jaunumi-page">
      <div class="container-fluid py-4 px-4">

        <div class="page-header mb-4">
          <h2 class="page-title">Jaunumi</h2>
          <span class="badge-count">{{ filtered.length }} no {{ signups.length }}</span>
          <label class="select-all-wrap">
            <input type="checkbox" [checked]="allFilteredSelected" (change)="toggleSelectAll()" />
            Atzīmēt visus
          </label>
          <span *ngIf="selectedIds.size > 0" class="badge-count">{{ selectedIds.size }} atlasīti</span>
        </div>

        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

        <div *ngIf="!loading && !error && signups.length === 0" class="empty-state">
          <p class="text-muted">Vēl neviens nav pieteicies jaunumiem.</p>
        </div>

        <div *ngIf="!loading && signups.length > 0" class="table-card">
          <div class="table-responsive">
            <table class="table jn-table mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>E-pasts</th>
                  <th>Tēma</th>
                  <th>Pieteikšanās datums</th>
                  <th>Atlasīts</th>
                </tr>
                <tr class="filter-row">
                  <th></th>
                  <th><input type="text" [(ngModel)]="filterEmail" (ngModelChange)="onFilterChange()" class="filter-input" placeholder="Meklēt..." /></th>
                  <th>
                    <select [(ngModel)]="filterTopic" (ngModelChange)="onFilterChange()" class="filter-input filter-select">
                      <option value="">Visas</option>
                      <option *ngFor="let t of uniqueTopics" [value]="t">{{ t }}</option>
                    </select>
                  </th>
                  <th><input type="text" [(ngModel)]="filterCreatedAt" (ngModelChange)="onFilterChange()" class="filter-input" placeholder="dd.mm.gggg" /></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of paged">
                  <td class="text-muted small">{{ s.id }}</td>
                  <td><a [href]="'mailto:' + s.email" class="email-link">{{ s.email }}</a></td>
                  <td><span class="topic-badge">{{ s.topic }}</span></td>
                  <td class="text-muted small">{{ s.createdAt | date:'dd.MM.yyyy HH:mm' }}</td>
                  <td class="text-center"><input type="checkbox" [checked]="isSelected(s.id)" (change)="toggleSelected(s.id)" /></td>
                </tr>
                <tr *ngIf="filtered.length === 0">
                  <td colspan="5" class="text-muted text-center py-4">Nav ierakstu, kas atbilst filtriem.</td>
                </tr>
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

        <div class="admin-section copy-section mt-4">
          <h4 class="section-heading">Kopēt atlasītos e-pastus</h4>
          <p class="broadcast-hint">Atlasīti {{ selectedIds.size }} e-pasti. Kopē kā tekstu, atdalītu ar atstarpēm.</p>
          <div class="broadcast-actions">
            <button class="btn btn-outline-primary" [disabled]="selectedIds.size === 0" (click)="copySelectedEmails()">
              Kopēt atlasītos e-pastus
            </button>
            <span *ngIf="copyMsg" class="broadcast-msg" [class.broadcast-error]="copyError">{{ copyMsg }}</span>
          </div>
        </div>

        <div class="admin-section broadcast-section mt-4">
          <h4 class="section-heading">Sūtīt e-pastu atlasītajiem</h4>
          <p class="broadcast-hint">Atlasīti {{ selectedIds.size }} e-pasti. Ziņa tiks sūtīta no brivadiena&#64;gmail.com.</p>
          <textarea
            class="form-control broadcast-textarea"
            rows="6"
            placeholder="Ievadi ziņas tekstu..."
            [(ngModel)]="broadcastMessage"
            [disabled]="broadcastSending"></textarea>
          <div class="broadcast-actions">
            <button class="btn btn-primary" [disabled]="broadcastSending || selectedIds.size === 0 || !broadcastMessage.trim()" (click)="sendBroadcast()">
              {{ broadcastSending ? 'Sūta...' : 'Sūtīt' }}
            </button>
            <span *ngIf="broadcastMsg" class="broadcast-msg" [class.broadcast-error]="broadcastError">{{ broadcastMsg }}</span>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .jaunumi-page { min-height: 100vh; background: #faf5f3; }

    .page-header { display: flex; align-items: center; gap: 14px; }

    .page-title { font-size: 1.5rem; font-weight: 700; color: #5C4033; margin: 0; }

    .badge-count {
      background: #f0e7e2; color: #5C4033; font-size: 0.8rem; font-weight: 600;
      padding: 3px 10px; border-radius: 20px;
    }

    .select-all-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: #5C4033;
      font-weight: 600;
      cursor: pointer;
      margin: 0 0 0 auto;
      user-select: none;
    }

    .select-all-wrap input[type="checkbox"] {
      cursor: pointer;
    }

    .table-card {
      background: #fff; border-radius: 12px;
      box-shadow: 0 2px 12px rgba(92, 64, 51, 0.07);
      overflow: hidden;
    }

    .jn-table thead th {
      background: #5C4033; color: #fff; font-size: 0.78rem; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 14px; border: none;
    }

    .jn-table tbody td { padding: 11px 14px; font-size: 0.875rem; vertical-align: middle; border-color: #faf0ed; }
    .jn-table tbody tr:hover { background: #f8faff; }

    .email-link { color: #5C4033; text-decoration: none; }
    .email-link:hover { text-decoration: underline; }

    .topic-badge {
      background: #f0e7e2; color: #5C4033; font-size: 0.78rem; font-weight: 600;
      padding: 3px 10px; border-radius: 20px; white-space: nowrap;
    }

    .empty-state { text-align: center; padding: 60px 0; }

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

    .admin-section {
      background: #fff;
      border-radius: 12px;
      padding: 24px 28px;
      box-shadow: 0 2px 12px rgba(92, 64, 51, 0.07);
    }

    .section-heading {
      font-size: 1.1rem;
      font-weight: 700;
      color: #5C4033;
      margin: 0 0 6px;
    }

    .broadcast-hint {
      font-size: 0.85rem;
      color: #777;
      margin: 0 0 14px;
    }

    .broadcast-textarea {
      resize: vertical;
      margin-bottom: 14px;
    }

    .broadcast-actions {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .broadcast-msg {
      font-size: 0.85rem;
      color: #198754;
    }

    .broadcast-msg.broadcast-error {
      color: #dc2626;
    }
  `]
})
export class AdminNewsletterSignupsComponent implements OnInit {
  signups: NewsletterSignup[] = [];
  loading = true;
  error = '';

  filterEmail = '';
  filterTopic = '';
  filterCreatedAt = '';

  pageSize = 25;
  currentPage = 1;

  selectedIds = new Set<number>();

  broadcastMessage = '';
  broadcastSending = false;
  broadcastMsg = '';
  broadcastError = false;

  copyMsg = '';
  copyError = false;

  constructor(private newsletterService: NewsletterService) {}

  ngOnInit(): void {
    this.newsletterService.getAll().subscribe({
      next: (data) => { this.signups = data; this.loading = false; },
      error: () => { this.error = 'Neizdevās ielādēt jaunumu pieteikumus.'; this.loading = false; }
    });
  }

  private fmt(date: string | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
  }

  get uniqueTopics(): string[] {
    return [...new Set(this.signups.map(s => s.topic))].sort();
  }

  get filtered(): NewsletterSignup[] {
    const email = this.filterEmail.toLowerCase();
    const createdAt = this.filterCreatedAt.toLowerCase();
    return this.signups.filter(s => {
      if (email && !s.email.toLowerCase().includes(email)) return false;
      if (this.filterTopic && s.topic !== this.filterTopic) return false;
      if (createdAt && !this.fmt(s.createdAt).includes(createdAt)) return false;
      return true;
    });
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get paged(): NewsletterSignup[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  toggleSelected(id: number): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  get allFilteredSelected(): boolean {
    return this.filtered.length > 0 && this.filtered.every(s => this.selectedIds.has(s.id));
  }

  toggleSelectAll(): void {
    if (this.allFilteredSelected) {
      this.filtered.forEach(s => this.selectedIds.delete(s.id));
    } else {
      this.filtered.forEach(s => this.selectedIds.add(s.id));
    }
  }

  private get selectedEmails(): string[] {
    return this.signups
      .filter(s => this.selectedIds.has(s.id))
      .map(s => s.email);
  }

  private fallbackCopy(text: string): boolean {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    document.body.removeChild(textarea);
    return ok;
  }

  copySelectedEmails(): void {
    const emails = this.selectedEmails;
    if (emails.length === 0) return;
    const text = emails.join(' ');
    this.copyError = false;

    const onSuccess = () => {
      this.copyMsg = `Nokopēti ${emails.length} e-pasti.`;
      setTimeout(() => { this.copyMsg = ''; }, 2500);
    };
    const onFailure = () => {
      if (this.fallbackCopy(text)) {
        onSuccess();
      } else {
        this.copyError = true;
        this.copyMsg = 'Neizdevās kopēt.';
      }
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess, onFailure);
    } else {
      onFailure();
    }
  }

  sendBroadcast(): void {
    const emails = this.selectedEmails;
    if (emails.length === 0 || !this.broadcastMessage.trim()) return;

    this.broadcastSending = true;
    this.broadcastMsg = '';
    this.broadcastError = false;
    this.newsletterService.sendBroadcast(emails, this.broadcastMessage.trim()).subscribe({
      next: (res) => {
        this.broadcastSending = false;
        this.broadcastMsg = `Nosūtīts ${res.sentCount} adresātiem.`;
        this.broadcastMessage = '';
      },
      error: (err) => {
        this.broadcastSending = false;
        this.broadcastError = true;
        this.broadcastMsg = err?.error?.error || 'Neizdevās nosūtīt e-pastu.';
      }
    });
  }
}
