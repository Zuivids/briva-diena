import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminStateService } from '../../shared/services/admin-state.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="faq-page">

      <div class="container py-5">
        <h2 class="page-title mb-4">BIEŽĀK UZDOTIE JAUTĀJUMI</h2>
        <div class="faq-list mx-auto">
          <div *ngIf="faqItems.length === 0" class="text-muted text-center py-5">
            Šobrīd nav pievienotu jautājumu.
          </div>
          <div *ngFor="let item of faqItems; let i = index" class="faq-item" [class.open]="openIndex === i">
            <button class="faq-question" (click)="toggle(i)">
              <span>{{ item.question }}</span>
              <span class="faq-icon">{{ openIndex === i ? '−' : '+' }}</span>
            </button>
            <div class="faq-answer" *ngIf="openIndex === i">
              {{ item.answer }}
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .faq-page { min-height: 60vh; }

    .page-title {
      color: #5C4033;
      font-weight: 700;
      text-align: center;
    }

    .faq-list {
      max-width: 760px;
    }

    .faq-item {
      border: 1px solid #e0e4ef;
      border-radius: 10px;
      margin-bottom: 12px;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }

    .faq-question {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 22px;
      background: none;
      border: none;
      text-align: left;
      font-size: 1rem;
      font-weight: 600;
      color: #1a1a2e;
      cursor: pointer;
      transition: background 0.15s;
    }

    .faq-question:hover { background: #f4f6fb; }

    .faq-item.open .faq-question { color: #5C4033; background: #f0f4ff; }

    .faq-icon {
      font-size: 1.3rem;
      font-weight: 400;
      color: #e87722;
      flex-shrink: 0;
      margin-left: 12px;
    }

    .faq-answer {
      padding: 0 22px 18px;
      font-size: 0.95rem;
      line-height: 1.7;
      color: #555;
      border-top: 1px solid #e8ebf4;
      padding-top: 14px;
    }
  `]
})
export class FAQComponent {
  faqItems: { id: string; question: string; answer: string }[] = [];
  openIndex: number | null = null;

  constructor(private adminState: AdminStateService) {
    this.adminState.faqItems$.subscribe(items => {
      this.faqItems = items;
    });
  }

  toggle(index: number): void {
    this.openIndex = this.openIndex === index ? null : index;
  }
}
