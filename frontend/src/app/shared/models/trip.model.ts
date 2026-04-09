export interface Trip {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  priceCents: number;
  currency: string;
  availableSpots: number;
  landingSection?: string;
  images?: string[];
  createdAt?: string;
  transportationType?: string;
  accommodation?: string;
  airlineCompany?: string;
  includedBaggageSize?: string;
  priceIncluded?: string;
  extraCharge?: string;
  itineraryJson?: string;
  tripDurationDays?: number;
}

export interface TripDay {
  dayNumber: number;
  date: string;
  description: string;
  imagePath?: string | null;
}

export interface TripFilter {
  month?: number;
  durationDays?: string;
  maxPrice?: number;
}
