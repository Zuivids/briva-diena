import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminStateService } from '../../shared/services/admin-state.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-page">

      <div class="about-header text-center">
        <div class="container">
          <h1 class="about-title">Par mums</h1>
        </div>
      </div>

      <div class="container about-body">
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

    .about-header {
      color: #e87722;
      padding: 60px 20px 50px;
    }

    .about-title {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 700;
      margin: 0;
    }

    .about-body {
      padding: 60px 20px;
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
