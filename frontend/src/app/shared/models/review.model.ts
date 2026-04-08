export interface Review {
  id: string;
  customerName: string;
  tripName?: string;
  rating: number;
  reviewText: string;
  createdAt?: string;
}
