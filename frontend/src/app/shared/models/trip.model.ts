export interface Trip {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  price: number;
  currency: string;
  availableSpots: number;
  images: string[];
  mainImage: string;
  createdAt: Date;
}

export interface TripFilter {
  month?: number;
  durationDays?: string;
  maxPrice?: number;
}
