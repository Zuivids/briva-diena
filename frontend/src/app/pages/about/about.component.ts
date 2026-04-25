import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminStateService } from '../../shared/services/admin-state.service';
import { AboutImageService } from '../../shared/services/about-image.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-page">

      <div class="container py-5">
        <h2 class="page-title mb-5">BRĪVA DIENA</h2>

        <div *ngFor="let t of sectionTexts; let i = index"
             class="about-row"
             [class.reversed]="i === 1">
          <div class="about-row-text">
            <p class="about-para" *ngIf="sectionTexts[i]">{{ sectionTexts[i] }}</p>
          </div>
          <div class="about-row-image" *ngIf="slotImages[i]">
            <img [src]="slotImages[i]" alt="Par mums" class="about-image" />
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .about-page { min-height: 60vh; }

    .page-title {
      color: #e87722;
      font-weight: 700;
      text-align: center;
    }

    .about-row {
      display: flex;
      gap: 48px;
      align-items: center;
      margin-bottom: 64px;
      max-width: 1000px;
      margin-left: auto;
      margin-right: auto;
    }

    .about-row.reversed {
      flex-direction: row-reverse;
    }

    .about-row-text {
      flex: 1;
      min-width: 0;
    }

    .about-row-image {
      flex-shrink: 0;
      width: 340px;
    }

    .about-para {
      font-size: 1.05rem;
      line-height: 1.8;
      color: #444;
      margin-bottom: 0;
    }

    .about-image {
      width: 100%;
      border-radius: 12px;
      object-fit: cover;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    }

    @media (max-width: 768px) {
      .about-row,
      .about-row.reversed {
        flex-direction: column;
        gap: 24px;
      }
      .about-row-image {
        width: 100%;
      }
    }
  `]
})
export class AboutComponent implements OnInit {
  sectionTexts: string[] = ['', '', ''];
  slotImages: (string | null)[] = [null, null, null];

  constructor(private adminState: AdminStateService, private aboutImageService: AboutImageService) {
    this.adminState.aboutPageContent$.subscribe(content => {
      const parts = content.split('\n\n');
      this.sectionTexts = [parts[0] ?? '', parts[1] ?? '', parts[2] ?? ''];
    });
  }

  ngOnInit(): void {
    this.aboutImageService.getImages().subscribe({
      next: (imgs) => {
        const slots: (string | null)[] = [null, null, null];
        imgs.forEach(img => { if (img.slotIndex >= 0 && img.slotIndex <= 2) slots[img.slotIndex] = '/images/' + img.path; });
        this.slotImages = slots;
      },
      error: () => { this.slotImages = [null, null, null]; }
    });
  }
}
