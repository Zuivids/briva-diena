import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsletterService } from '../../services/newsletter.service';
import { FutureTripTopicService, FutureTripTopic } from '../../services/future-trip-topic.service';

const ALL_TOPICS = 'Visi';

@Component({
  selector: 'app-newsletter-signup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="open" class="modal-backdrop" (click)="close()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <ng-container *ngIf="!success">
          <h3 class="modal-title">Uzzini par jaunākajiem ceļojumiem</h3>
          <p class="modal-body">Atstāj savu e-pastu un izvēlies tēmu, par kuru vēlies uzzināt jaunumus.</p>
          <label class="field-label">Tēma</label>
          <div class="select-wrap" [class.open]="dropdownOpen">
            <button type="button" class="topic-select-btn" [disabled]="submitting" (click)="toggleDropdown($event)">
              <span>{{ selectedTopic }}</span>
              <svg class="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <ul class="topic-options" *ngIf="dropdownOpen">
              <li [class.selected]="selectedTopic === allTopicsValue" (click)="selectTopic(allTopicsValue)">Visi</li>
              <li *ngFor="let topic of topics" [class.selected]="selectedTopic === topic.title" (click)="selectTopic(topic.title)">{{ topic.title }}</li>
            </ul>
          </div>
          <label class="field-label">E-pasts</label>
          <input
            type="email"
            class="email-input"
            placeholder="tavs@epasts.lv"
            [(ngModel)]="email"
            (keydown.enter)="submit()"
            [disabled]="submitting" />
          <p *ngIf="error" class="error-text">{{ error }}</p>
          <div class="modal-actions">
            <button class="modal-btn-cancel" (click)="close()" [disabled]="submitting">Atcelt</button>
            <button class="modal-btn-confirm" (click)="submit()" [disabled]="submitting">
              {{ submitting ? 'Sūta...' : 'Pieteikties' }}
            </button>
          </div>
        </ng-container>
        <ng-container *ngIf="success">
          <h3 class="modal-title">Paldies!</h3>
          <p class="modal-body">Tu esi pieteicies jaunumiem par 2027. gada ceļojumiem.</p>
          <div class="modal-actions">
            <button class="modal-btn-confirm" (click)="close()">Aizvērt</button>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(30, 15, 10, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
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

    .modal-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #5C4033;
      margin: 0 0 10px;
    }

    .modal-body {
      font-size: 0.9rem;
      color: #444;
      margin: 0 0 20px;
      line-height: 1.5;
    }

    .field-label {
      display: block;
      text-align: left;
      font-size: 0.72rem;
      font-weight: 600;
      color: #a87c3f;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .select-wrap {
      position: relative;
      margin-bottom: 18px;
    }

    .topic-select-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      width: 100%;
      border: 1.5px solid #d8c39a;
      border-radius: 12px;
      padding: 13px 16px 13px 18px;
      font-size: 0.95rem;
      font-weight: 500;
      letter-spacing: 0.015em;
      text-align: left;
      outline: none;
      background: linear-gradient(#fffdf9, #fbf6ec);
      color: #3a2a1c;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(92, 64, 51, 0.08), inset 0 1px 0 rgba(255,255,255,0.6);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .select-wrap:hover .topic-select-btn {
      border-color: #c9a45c;
    }

    .select-wrap.open .topic-select-btn {
      border-color: #a87c3f;
      box-shadow: 0 0 0 3px rgba(168, 124, 63, 0.18), 0 1px 3px rgba(92, 64, 51, 0.08);
    }

    .topic-select-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .select-chevron {
      width: 18px;
      height: 18px;
      flex: none;
      color: #a87c3f;
      transition: color 0.2s ease, transform 0.2s ease;
    }

    .select-wrap:hover .select-chevron {
      color: #cf6510;
    }

    .select-wrap.open .select-chevron {
      color: #5C4033;
      transform: rotate(180deg);
    }

    .topic-options {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      z-index: 10;
      margin: 0;
      padding: 6px;
      list-style: none;
      max-height: 240px;
      overflow-y: auto;
      background: #fffdf9;
      border: 1.5px solid #d8c39a;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(92, 64, 51, 0.18);
      animation: optionsIn 0.14s ease;
    }

    @keyframes optionsIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .topic-options li {
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 500;
      color: #3a2a1c;
      text-align: left;
      cursor: pointer;
      transition: background 0.12s ease;
    }

    .topic-options li:hover {
      background: #f5e9d8;
    }

    .topic-options li.selected {
      background: #a87c3f;
      color: #fff;
    }

    .email-input {
      width: 100%;
      border: 1px solid #cbb5ae;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 0.95rem;
      outline: none;
      margin-bottom: 6px;
    }

    .email-input:focus {
      border-color: #5C4033;
      box-shadow: 0 0 0 2px rgba(92,64,51,0.12);
    }

    .error-text {
      color: #dc2626;
      font-size: 0.82rem;
      margin: 6px 0 0;
      text-align: left;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-top: 20px;
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
    .modal-btn-cancel:hover { background: #e8d5ce; }
    .modal-btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

    .modal-btn-confirm {
      background: #e87722;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 8px 24px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .modal-btn-confirm:hover { background: #cf6510; }
    .modal-btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class NewsletterSignupModalComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Input() preselectedTopic: string | null = null;
  @Output() closed = new EventEmitter<void>();

  readonly allTopicsValue = ALL_TOPICS;
  topics: FutureTripTopic[] = [];
  selectedTopic = ALL_TOPICS;
  dropdownOpen = false;

  email = '';
  submitting = false;
  success = false;
  error = '';

  ngOnInit(): void {
    this.topicService.getAll().subscribe({
      next: (topics) => { this.topics = topics; },
      error: () => {}
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.selectedTopic = this.preselectedTopic || ALL_TOPICS;
      this.dropdownOpen = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.dropdownOpen && !(event.target as HTMLElement).closest('.select-wrap')) {
      this.dropdownOpen = false;
    }
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    if (this.submitting) return;
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectTopic(title: string): void {
    this.selectedTopic = title;
    this.dropdownOpen = false;
  }

  submit(): void {
    const value = this.email.trim();
    if (!value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      this.error = 'Ievadi derīgu e-pasta adresi.';
      return;
    }
    this.error = '';
    this.submitting = true;
    this.newsletterService.signup(value, this.selectedTopic).subscribe({
      next: () => {
        this.submitting = false;
        this.success = true;
      },
      error: () => {
        this.submitting = false;
        this.error = 'Neizdevās nosūtīt. Mēģini vēlreiz.';
      }
    });
  }

  close(): void {
    this.open = false;
    this.email = '';
    this.error = '';
    this.success = false;
    this.submitting = false;
    this.selectedTopic = ALL_TOPICS;
    this.dropdownOpen = false;
    this.closed.emit();
  }

  constructor(private newsletterService: NewsletterService, private topicService: FutureTripTopicService) {}
}
