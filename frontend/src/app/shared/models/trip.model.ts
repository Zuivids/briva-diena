export interface Trip {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  priceCents: number;
  currency: string;
  availableSpots: number;
  images?: string[];
  createdAt?: string;
}

export interface TripFilter {
  month?: number;
  durationDays?: string;
  maxPrice?: number;
}
