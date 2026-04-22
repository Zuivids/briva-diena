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
        <h2 class="page-title mb-4">BRĪVA DIENA</h2>
        <div class="about-layout mx-auto" [class.has-images]="images.length > 0">
          <div class="about-text-wrap">
            <p *ngFor="let para of paragraphs" class="about-para">{{ para }}</p>
          </div>
          <div *ngIf="images.length > 0" class="about-images-wrap">
            <img *ngFor="let img of images" [src]="img" alt="Par mums" class="about-image" />
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

    .about-layout {
      max-width: 1000px;
    }

    .about-layout.has-images {
      display: flex;
      gap: 48px;
      align-items: flex-start;
    }

    .about-text-wrap {
      flex: 1;
      min-width: 0;
    }

    .about-para {
      font-size: 1.05rem;
      line-height: 1.8;
      color: #444;
      margin-bottom: 1.4rem;
    }

    .about-images-wrap {
      flex-shrink: 0;
      width: 280px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .about-image {
      width: 100%;
      border-radius: 12px;
      object-fit: cover;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    }

    @media (max-width: 768px) {
      .about-layout.has-images {
        flex-direction: column;
      }
      .about-images-wrap {
        width: 100%;
        flex-direction: row;
        flex-wrap: wrap;
      }
      .about-image {
        width: calc(50% - 8px);
      }
    }
  `]
})
export class AboutComponent implements OnInit {
  paragraphs: string[] = [];
  images: string[] = [];

  constructor(private adminState: AdminStateService, private aboutImageService: AboutImageService) {
    this.adminState.aboutPageContent$.subscribe(content => {
      this.paragraphs = content.split('\n').filter(p => p.trim().length > 0);
    });
  }

  ngOnInit(): void {
    this.aboutImageService.getImages().subscribe({
      next: (imgs) => {
        const slots = ['', '', ''];
        imgs.forEach(img => { if (img.slotIndex >= 0 && img.slotIndex <= 2) slots[img.slotIndex] = '/images/' + img.path; });
        this.images = slots.filter(s => !!s);
      },
      error: () => { this.images = []; }
    });
  }
}
