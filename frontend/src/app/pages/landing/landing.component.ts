import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-page">
      <!-- Featured Trips Section -->
      <section class="featured-trips py-5">
        <div class="container">
          <h2 class="mb-4">Pieejamie ceļojumi</h2>
          <p class="text-muted">Featured trips will be displayed here</p>
          <div class="text-center mt-4">
            <a routerLink="/trips" class="btn btn-primary btn-lg">
              Apskatīt visus
            </a>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section class="about-section py-5 bg-light">
        <div class="container">
          <h2>Kas ir Brīva diena?</h2>
          <p>Brīva diena ir ceļojumu aģentūra, kas piedāvā neatvairāmas ceļojuma pieredzes par pieņemamām cenām...</p>
        </div>
      </section>

      <!-- Reviews Section -->
      <section class="reviews-section py-5">
        <div class="container">
          <h2>Atsauksmes</h2>
          <p class="text-muted">Customer reviews will be displayed here</p>
          <div class="text-center mt-4">
            <a routerLink="/reviews" class="btn btn-outline-primary">
              Apskatīt vairāk atsauksmju
            </a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-page {
      min-height: 100vh;
    }
    
    h2 {
      color: #0d6efd;
      font-weight: bold;
    }
  `]
})
export class LandingComponent {}
