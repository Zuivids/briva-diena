import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminStateService } from '../../shared/services/admin-state.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="faq-page">

      <div class="faq-header text-center">
        <div class="container">
          <h1 class="faq-title">Biežāk uzdotie jautājumi</h1>
        </div>
      </div>

      <div class="container faq-body">
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

    .faq-header {
      background: linear-gradient(135deg, #1746a0 0%, #2563d4 100%);
      color: #fff;
      padding: 60px 20px 50px;
    }

    .faq-title {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 700;
      margin: 0;
    }

    .faq-body {
      padding: 60px 20px;
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

    .faq-item.open .faq-question { color: #1746a0; background: #f0f4ff; }

    .faq-icon {
      font-size: 1.3rem;
      font-weight: 400;
      color: #1746a0;
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
