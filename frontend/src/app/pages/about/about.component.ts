import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminStateService } from '../../shared/services/admin-state.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-page">

      <div class="container py-5">
        <h2 class="page-title mb-4">Par mums</h2>
        <div class="about-layout mx-auto" [class.has-image]="imageSrc">
          <div *ngIf="imageSrc" class="about-image-wrap">
            <img [src]="imageSrc" alt="Par mums" class="about-image" />
          </div>
          <div class="about-text-wrap">
            <p *ngFor="let para of paragraphs" class="about-para">{{ para }}</p>
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
      max-width: 900px;
    }

    .about-layout.has-image {
      display: flex;
      gap: 48px;
      align-items: flex-start;
    }

    .about-image-wrap {
      flex-shrink: 0;
      width: 320px;
    }

    .about-image {
      width: 100%;
      border-radius: 12px;
      object-fit: cover;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
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

    @media (max-width: 700px) {
      .about-layout.has-image {
        flex-direction: column;
      }
      .about-image-wrap {
        width: 100%;
      }
    }
  `]
})
export class AboutComponent {
  paragraphs: string[] = [];
  imageSrc: string | null = null;

  constructor(private adminState: AdminStateService) {
    this.adminState.aboutPageContent$.subscribe(content => {
      this.paragraphs = content.split('\n').filter(p => p.trim().length > 0);
    });
    this.adminState.aboutPageImage$.subscribe(img => {
      this.imageSrc = img;
    });
  }
}
