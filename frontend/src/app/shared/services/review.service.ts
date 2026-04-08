import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private reviews: Review[] = [
    {
      id: '1',
      customerName: 'Anna K.',
      rating: 5,
      reviewText: 'Brīnišķīgs ceļojums! Organizācija bija nevainojama, un iespaidi paliks atmiņā visu mūžu.',
      createdAt: '2025-01-15'
    },
    {
      id: '2',
      customerName: 'Mārtiņš L.',
      rating: 5,
      reviewText: 'Izcils serviss un draudzīga komanda. Noteikti iesaku visiem, kas meklē neaizmirstamus piedzīvojumus!',
      createdAt: '2025-02-20'
    },
    {
      id: '3',
      customerName: 'Ilze Z.',
      rating: 4,
      reviewText: 'Ļoti skaistas vietas un labi organizēts maršruts. Priecājos, ka izvēlējos šo ceļojumu.',
      createdAt: '2025-03-05'
    }
  ];

  getAllReviews(): Observable<Review[]> {
    return of([...this.reviews]);
  }

  getLatestReviews(limit: number = 3): Observable<Review[]> {
    return of(this.reviews.slice(-limit));
  }

  createReview(review: Omit<Review, 'id' | 'createdAt'>): Observable<Review> {
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    this.reviews.push(newReview);
    return of(newReview);
  }

  deleteReview(reviewId: string): Observable<void> {
    this.reviews = this.reviews.filter(r => r.id !== reviewId);
    return of(void 0);
  }
}
