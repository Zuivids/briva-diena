import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-page">

      <!-- Hero Section -->
      <section class="hero-section">
        <img src="italy_mountain.png" alt="Italy mountain" class="hero-image" />
        <div class="hero-text">
          <h1>Piedzīvojumi, kas pilni ar atklājumiem</h1>
        </div>
      </section>

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

    .hero-section {
      position: relative;
      width: 100%;
      overflow: hidden;
    }

    .hero-image {
      width: 100%;
      height: auto;
      max-height: 50vh;
      display: block;
      object-fit: cover;
    }

    .hero-text {
      position: absolute;
      top: 70%;
      right: 0;
      transform: translateY(-50%);
      padding: 0 2rem;
    }

    .hero-text h1 {
      color: #fff;
      font-size: clamp(1.75rem, 4vw, 3.5rem);
      font-weight: 700;
      text-shadow: 0 2px 12px rgba(0,0,0,0.45);
      margin: 0;
      line-height: 1.2;
    }

    h2 {
      color: #0d6efd;
      font-weight: bold;
    }
  `]
})
export class LandingComponent {}
