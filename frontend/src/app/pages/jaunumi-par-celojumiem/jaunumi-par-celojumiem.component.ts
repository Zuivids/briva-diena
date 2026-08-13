import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsletterSignupModalComponent } from '../../shared/components/newsletter-signup-modal/newsletter-signup-modal.component';
import { FutureTripTopicService, FutureTripTopic } from '../../shared/services/future-trip-topic.service';
import { FutureTripsCardService } from '../../shared/services/future-trips-card.service';

@Component({
  selector: 'app-jaunumi-par-celojumiem',
  standalone: true,
  imports: [CommonModule, NewsletterSignupModalComponent],
  template: `
    <div class="topics-page">
      <div class="container py-5">
        <h1 class="page-title mb-3">JAUNIE CEĻOJUMI 2027</h1>
        <p class="page-intro mb-5">{{ introText }}</p>

        <div class="row g-4 topics-row">
          <div *ngFor="let topic of topics" class="col-md-4">
            <div class="topic-card">
              <img *ngIf="topic.imagePath" [src]="'/images/' + topic.imagePath" class="topic-image" alt="{{ topic.title }}" />
              <h2 class="topic-title">{{ topic.title }}</h2>
              <p class="topic-desc">{{ topic.description }}</p>
              <button class="btn-register-sm" (click)="openModal(topic.title)">Pieteikties</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-newsletter-signup-modal [open]="modalOpen" [preselectedTopic]="modalTopic" (closed)="modalOpen = false"></app-newsletter-signup-modal>
  `,
  styles: [`
    .topics-page { min-height: 100vh; padding-top: 90px; background: #faf5f3; }
    .page-title { color: #5C4033; text-align: center; font-weight: 700; }
    .page-intro { color: #555; text-align: left; max-width: 720px; margin: 0 auto; line-height: 1.6; white-space: pre-line; }

    .topics-row { justify-content: center; }

    .topic-image {
      width: 100%;
      height: 180px;
      object-fit: cover;
      margin-bottom: 16px;
    }

    .topic-card {
      border: 1px solid #e8ebf4;
      border-radius: 0;
      height: 100%;
      background: #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      transition: transform 0.18s, box-shadow 0.18s;
      padding: 24px;
      display: flex;
      flex-direction: column;
    }
    .topic-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
    .topic-title { font-weight: 600; color: #5C4033; margin-bottom: 8px; font-size: 1.15rem; }
    .topic-desc { color: #666; flex-grow: 1; margin-bottom: 16px; }

    .btn-register-sm {
      align-self: center;
      background: #e87722; color: #fff; border: none;
      border-radius: 6px; font-size: 0.85rem; font-weight: 500; padding: 6px 16px;
      cursor: pointer; transition: background 0.15s;
    }
    .btn-register-sm:hover { background: #cf6510; }
  `]
})
export class JaunumiParCelojumiemComponent implements OnInit {
  modalOpen = false;
  modalTopic: string | null = null;
  topics: FutureTripTopic[] = [];
  introText = '2027. gadā plānojam vairākus jaunus ceļojumu virzienus. Precīzi datumi un cenas vēl tiek apstiprināti — piesakies uz jebkuru no tēmām, un mēs tevi informēsim, tiklīdz būs jaunumi.';

  constructor(private topicService: FutureTripTopicService, private futureTripsCardService: FutureTripsCardService) {}

  ngOnInit(): void {
    this.topicService.getAll().subscribe({
      next: (topics) => { this.topics = topics; },
      error: () => {}
    });
    this.futureTripsCardService.get().subscribe({
      next: (card) => { if (card.introText) this.introText = card.introText; },
      error: () => {}
    });
  }

  openModal(topicTitle: string): void {
    this.modalTopic = topicTitle;
    this.modalOpen = true;
  }
}
